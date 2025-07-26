const db = require("../database/db");
const c = require("../constants/Backend");
const helpers = require("../helpers/Common");
const t = require("../constants/Tables");
const moment = require('moment');
const stripe = require("stripe")(c.STRIPE.secretKey);
const stipeStatusForFree = ["incomplete", "incomplete_expired", "past_due", "unpaid"];
module.exports = {
	stripeWebhooks: async function(req,res){
        let connection,webhookId;
        const payload = req.body;
		try{
			console.log("===================== COMMON_LOGS WEBHOOKS ======== ", payload);

			connection = await db.getConnectionAsync();
            let getUser = null
			const currentDateTimeObj = await helpers.dateConvertToUTC();
            const currentDateTime = currentDateTimeObj.totalDate;
			let subscription = null;
			let schedule_response = null;
            let subData = payload.data.object
			if(subData.object == "subscription_schedule") {
				if(!subData.subscription){
					subData.subscription = subData.released_subscription
				}
				schedule_response = subData;
				subscription = await stripe.subscriptions.retrieve(subData.subscription);
				if(subscription){
					subData = subscription
				}
			}
			/**
			 * insert webhook in db for backup
			 */
            const webhooks = connection.queryAsync(`INSERT INTO ${t.WEBHOOKS} (event_id,type,response,schedule_response,created,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`,[payload.id,payload.type,JSON.stringify(subData),JSON.stringify(schedule_response),payload.created,currentDateTime,currentDateTime]);
            webhookId = (await webhooks).insertId;
			
			// get plans id from subdata obj
			let stripePlanId = (subData.plan) ? subData.plan.id : ""
            const endDate = moment.unix(subData.current_period_end).format("YYYY-MM-DD H:mm:ss");
			let userMembershipId = ""
			// get membership plans from db and get membership plan id 
			let getPlans = await connection.queryAsync(`SELECT id, stripe_price_id FROM ${t.MEMBERSHIPS} WHERE stripe_price_id = ?`,[stripePlanId])
            if(getPlans && getPlans.length){
				getPlans = getPlans[0]
				userMembershipId = getPlans.id;
			}
			
			// get latest transaction from db 
			let transactions = await connection.queryAsync(`SELECT * FROM ${t.TRANSACTION} WHERE stripe_transaction_id = ? AND membership_id = ? ORDER BY id DESC`,[subData.id, userMembershipId]);
			if(transactions && transactions.length){
				transactions = transactions[0]
				getUser = await connection.queryAsync(`SELECT * FROM ${t.USERS} WHERE id = ?`,[transactions.user_id]);
				if(getUser && getUser.length){
					getUser = getUser[0]
				}
			}else{
				return res.end();
			}
			/**
			 *  if user have high school
			 *  then we are ignoring all webhooks
			 *  if user cancel plan and got customer.subscription.deleted then we will update transaction status cancel and user moved to membership id 3 and delete upcoming all events data
			 */
			if(getUser && getUser.s_type == "high_school"){
				if(payload.type == "customer.subscription.deleted"){
					await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE id = ?`, ["canceled", transactions.id ]);

					await connection.queryAsync(`UPDATE ${t.USERS} SET stripe_next_billing_date = ?,stripe_subscription_end_date = ?, membership_id = ?, stripe_last_transaction_id = ? WHERE id = ?`, [null, endDate, c.ATHLETE_PLANS.PREMIUM_PLUS.id,null, getUser.id]);

					await connection.queryAsync(`DELETE FROM ${t.TRANSACTION} WHERE user_id = ? AND status = ?`,[getUser.id, 'upcoming']);
				}
				return res.end();
			}

			// get transactions for update and add logic for update transction
			let updateTransactions = await connection.queryAsync(`SELECT * FROM ${t.TRANSACTION} WHERE user_id = ? AND status = ? AND stripe_transaction_id = ? ORDER BY id DESC`,[getUser.id, 'update', subData.id]);
			if(updateTransactions && updateTransactions.length){
				updateTransactions = updateTransactions[0]
			}else{
				updateTransactions = null
			}

			// get transactions for downgrate and add logic for down transction
			let downTransactions = await connection.queryAsync(`SELECT * FROM ${t.TRANSACTION} WHERE user_id = ? AND status = ? AND stripe_transaction_id = ? ORDER BY id DESC`,[getUser.id, 'upcoming', subData.id]);
			if(downTransactions && downTransactions.length){
				downTransactions = downTransactions[0]
			}else{
				downTransactions = null
			}
			
			// get transactions for trial and add logic for trial transction
			let trialTransactions = await connection.queryAsync(`SELECT * FROM ${t.TRANSACTION} WHERE user_id = ? AND status = ? AND stripe_transaction_id = ? ORDER BY id DESC`,[getUser.id, 'trialing', subData.id]);
			if(trialTransactions && trialTransactions.length){
				trialTransactions = trialTransactions[0]
			}else{
				trialTransactions = null
			}
			/**
			 * Mention stipeStatusForFree free on top ["incomplete", "incomplete_expired", "past_due", "unpaid"]
			 * and plan move to free in case of that status
			 */
			if(stipeStatusForFree.includes(subData.status)){
				if(subData.status == "incomplete_expired"){
					await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE id = ? AND status = ?`, ['incomplete_expired',transactions.id,"incomplete"]);
				}
				if(subData.status != "incomplete_expired"){
					let transStatus = "incomplete";
					if(subData.status != "incomplete"){
						transStatus = "expired";
					}
					await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE id = ? AND status = ?`, [transStatus, transactions.id, "active"]);

					await connection.queryAsync(`INSERT INTO ${t.TRANSACTION} (first_name, last_name, email, phone, street, state_id, city_id, zip, stripe_transaction_id, response, membership_id, user_id, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [transactions.first_name, transactions.last_name, transactions.email, transactions.phone, transactions.street, transactions.state_id, transactions.city_id, transactions.zip, null, null, c.ATHLETE_PLANS.FREE.id, transactions.user_id, "active", currentDateTime, currentDateTime]);
					// update user table when sub stipeStatusForFree
					await connection.queryAsync(`UPDATE ${t.USERS} SET stripe_next_billing_date = ?, stripe_subscription_end_date = ?, membership_id = ?, stripe_last_transaction_id = ? WHERE id = ?`, [null, endDate, c.ATHLETE_PLANS.FREE.id, null, getUser.id]);
				}
				return res.end();
			}

			let updateStatus = false;

			/**
			 * handle all webhook in switch cases
			 */
			switch (payload.type) {
				case "customer.subscription.created":
					
					break;
				case "customer.subscription.updated":
					// 3 != 2 case of premium+ to premium
					if(updateTransactions && getPlans.id != updateTransactions.membership_id){ // update case
						await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE user_id = ? AND stripe_transaction_id = ? AND status = ? ORDER BY id DESC`, ["expired", getUser.id, subData.id, "update" ]);
						updateStatus = true
					}

					// 2 != 3 same in case of premium != to premium+ 
					if(downTransactions && getPlans.id == downTransactions.membership_id){ // down case
						await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE user_id = ? AND stripe_transaction_id = ? AND status = ? ORDER BY id DESC`, ["expired", getUser.id, subData.id, "active" ]);
						await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE user_id = ? AND stripe_transaction_id = ? AND status = ? ORDER BY id DESC`, ["active", getUser.id, subData.id, "upcoming" ]);
						updateStatus = true;
					}
					
					if(trialTransactions && getPlans.id == trialTransactions.membership_id && !subData.cancellation_details.reason){ // trial case
						await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE user_id = ? AND stripe_transaction_id = ? AND status = ? ORDER BY id DESC`, ["active", getUser.id, subData.id, "trialing" ]);
						updateStatus = true
					}

					if(!updateStatus && subData.status == "active" && !subData.cancellation_details.reason){
						updateStatus = true
					}
				
					// update for update status to expired upgrade
					if(updateStatus){
						await connection.queryAsync(`UPDATE ${t.USERS} SET stripe_next_billing_date = ?,stripe_subscription_end_date = ?, membership_id = ? WHERE id = ?`, [endDate, null, userMembershipId, getUser.id]);
					}
					break;
				case "customer.subscription.deleted":
					await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE id = ?`, ["canceled", transactions.id ]);
					await connection.queryAsync(`UPDATE ${t.USERS} SET stripe_next_billing_date = ?,stripe_subscription_end_date = ?, membership_id = ?, stripe_last_transaction_id = ? WHERE id = ?`, [null, endDate, c.ATHLETE_PLANS.FREE.id,null, getUser.id]);
					await connection.queryAsync(`DELETE FROM ${t.TRANSACTION} WHERE user_id = ? AND status = ?`,[getUser.id, 'upcoming']);
					if(!downTransactions && getUser && getUser.s_type != "high_school"){
						await connection.queryAsync(`INSERT INTO ${t.TRANSACTION} (first_name, last_name, email, phone, street, state_id, city_id, zip, stripe_transaction_id, response, membership_id, user_id, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [transactions.first_name, transactions.last_name, transactions.email, transactions.phone, transactions.street, transactions.state_id, transactions.city_id, transactions.zip, null, null, c.ATHLETE_PLANS.FREE.id, transactions.user_id, "active", currentDateTime, currentDateTime]);
					}
					break;
				case "customer.subscription.canceled":
					await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE user_id = ? AND stripe_transaction_id = ? AND status IN (?) ORDER BY id DESC`, ["canceled", getUser.id, subData.id, ["active", "trialing"] ]);
					await connection.queryAsync(`UPDATE ${t.USERS} SET stripe_next_billing_date = ?,stripe_subscription_end_date = ?, membership_id = ?, stripe_last_transaction_id = ? WHERE id = ?`, [null, endDate, c.ATHLETE_PLANS.FREE.id,null, getUser.id]);					
					if(!downTransactions){
						await connection.queryAsync(`DELETE FROM ${t.TRANSACTION} WHERE user_id = ? AND status = ?`,[getUser.id, 'upcoming']);
						await connection.queryAsync(`INSERT INTO ${t.TRANSACTION} (first_name, last_name, email, phone, street, state_id, city_id, zip, stripe_transaction_id, response, membership_id, user_id, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [transactions.first_name, transactions.last_name, transactions.email, transactions.phone, transactions.street, transactions.state_id, transactions.city_id, transactions.zip, null, null, c.ATHLETE_PLANS.FREE.id, transactions.user_id, "active", currentDateTime, currentDateTime]);
					}
					break;
				case "customer.subscription.paused":
					
					break;
				case "invoice.created":
					
					break;
				case "invoice.upcoming":
					
					break;
				case "subscription_schedule.created":
					
					break;
				case "subscription_schedule.updated":
					// 3 != 2
					if(updateTransactions && getPlans.id != updateTransactions.membership_id){ // update case
						await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE user_id = ? AND stripe_transaction_id = ? AND status = ? ORDER BY id DESC`, ["expired", getUser.id, subData.id, "update" ]);
						updateStatus = true
					}

					// 2 != 3
					if(downTransactions && getPlans.id == downTransactions.membership_id){ // down case
						await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE user_id = ? AND stripe_transaction_id = ? AND status = ? ORDER BY id DESC`, ["expired", getUser.id, subData.id, "active" ]);
						await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE user_id = ? AND stripe_transaction_id = ? AND status = ? ORDER BY id DESC`, ["active", getUser.id, subData.id, "upcoming" ]);
						updateStatus = true
					}
					if(!updateStatus && subData.status == "active" && !subData.cancellation_details.reason){
						updateStatus = true
					}
					if(updateStatus){
						await connection.queryAsync(`UPDATE ${t.USERS} SET stripe_next_billing_date = ?,stripe_subscription_end_date = ?, membership_id = ? WHERE id = ?`, [endDate, null, userMembershipId, getUser.id]);
					}
					break;
				case "subscription_schedule.canceled":
					await connection.queryAsync(`UPDATE ${t.TRANSACTION} SET status = ? WHERE user_id = ? AND stripe_transaction_id = ? AND status = ? ORDER BY id DESC`, ["canceled", getUser.id, subData.id, "active" ]);
					await connection.queryAsync(`UPDATE ${t.USERS} SET stripe_next_billing_date = ?,stripe_subscription_end_date = ?, membership_id = ?, stripe_last_transaction_id = ? WHERE id = ?`, [null, endDate, c.ATHLETE_PLANS.FREE.id,null, getUser.id]);
					await connection.queryAsync(`INSERT INTO ${t.TRANSACTION} (first_name, last_name, email, phone, street, state_id, city_id, zip, stripe_transaction_id, response, membership_id, user_id, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [transactions.first_name, transactions.last_name, transactions.email, transactions.phone, transactions.street, transactions.state_id, transactions.city_id, transactions.zip, null, null, c.ATHLETE_PLANS.FREE.id, transactions.user_id, "active", currentDateTime, currentDateTime]);
					break;
				case "subscription_schedule.completed":
					
					break;
				case "subscription_schedule.aborted":
					
					break;
				case "subscription_schedule.expiring":
					
					break;
				case "subscription_schedule.released":
					
					break;
				default:
					
					break;
			}
		
			return res.end();
		}catch(e){
			helpers.handleException(e,res);
		}finally{
			if(connection){
				connection.release();
			}
		}
	},

	refundsWebhooks: async function(req,res){
		let connection,webhookId;
        const payload = req.body;
		try{
			console.log("===================== COMMON_LOGS WEBHOOKS ======== ", payload);

			let subData = payload.data.object
			let schedule_response = null;

			const currentDateTimeObj = await helpers.dateConvertToUTC();
			const currentDateTime = currentDateTimeObj.totalDate;

			connection = await db.getConnectionAsync();
			/**
			 * insert webhook in db for backup
			 */
            const webhooks = connection.queryAsync(`INSERT INTO ${t.WEBHOOKS} (event_id,type,response,schedule_response,created,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`,[payload.id,payload.type,JSON.stringify(subData),JSON.stringify(schedule_response),payload.created,currentDateTime,currentDateTime]);
            webhookId = (await webhooks).insertId;
			
			switch (payload.type) {
				case "charge.refund.updated":
					let [refundData] = await connection.queryAsync(`SELECT id,combine_session_transactions_id FROM ${t.COMBINE_SESSIONS_REFUNDS} WHERE txn_id = ?`, [subData.id]);
					if(refundData){
						await connection.queryAsync(`UPDATE ${t.COMBINE_SESSIONS_REFUNDS} SET refund_status = ? , updated_at = ? WHERE id = ?`, [subData.status,currentDateTime, refundData.id]);
						if(subData.status == "failed"){
							await connection.queryAsync(`UPDATE ${t.COMBINE_SESSION_TRANSACTIONS} SET refund_status = ? , updated_at = ? WHERE id = ?`, ["failed",currentDateTime, refundData.combine_session_transactions_id]);
						}else if(subData.status == "succeeded"){
							await connection.queryAsync(`UPDATE ${t.COMBINE_SESSION_TRANSACTIONS} SET refund_status = ? , updated_at = ? WHERE id = ?`, [null,currentDateTime, refundData.combine_session_transactions_id]);
						}
					}
				break;

				default:
					
				break;
			}

			return res.end();
		}catch(e){
			helpers.handleException(e,res);
		}finally{
			if(connection){
				connection.release();
			}
		}
	}
}