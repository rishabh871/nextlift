const moment = require('moment');
const axios = require('axios');
const twilio = require('twilio');
const db = require("../database/db");
const {API_STATUS,CHATBOT,DELETE_FLAG} = require("../constants/Backend");
const t = require("../constants/Tables");
const helpers = require("../helpers/Common");
const {getData,insertData,updateData} = require("../helpers/QueryHelper");
const messages = require("../constants/Messages");
const client = twilio(CHATBOT.TWILIO_ACCOUNT_SID,CHATBOT.TWILIO_AUTH_TOKEN);

const checkUserIsPremium = async(connection,fromNumber) => {
    let isPremium = false;
    try{
        let phoneWithCode = fromNumber.replaceAll("whatsapp:","");
        let phoneWithoutCode = phoneWithCode.replaceAll("+91","").replaceAll("+61","");
        const [user] = await getData(connection,t.USERS,'*',`(phone = '${phoneWithCode}' OR phone LIKE '%${phoneWithoutCode}%')`);
        if(user && (user.membership_id === 2 || user.membership_id === 3)){
            isPremium = true;
        }
    }catch(e){
        console.log(e);
    }finally{
        return isPremium;
    }
}
const checkStopWords = async(connection,message) => {
    let isStopWordExist = false;
    try{
        const stopWords = await getData(connection,t.STOP_WORDS,'name',`is_deleted = ${DELETE_FLAG.FALSE}`);
        if(stopWords.length){
            for(let i=0;i<stopWords.length;i++){
                let stopWord = stopWords[i];
                if(stopWord && stopWord.name && message.includes(stopWord.name)){
                    isStopWordExist = true;
                }
            }
        }
    }catch(e){
        console.log(e);
    }finally{
        return isStopWordExist;
    }
}
const receiveMessages = async(req,res) => {
    let connection,messageObj;
    try{
        connection = await db.getConnectionAsync();
        const dateTime = (await helpers.dateConvertToUTC()).totalDate;
        let {From: fromNumber,Body: bodyMessage,SmsStatus: smsStatus,ButtonPayload: buttonPayloadId,Latitude: latitude,Longitude: longitude,MessageType: messageType} = req.body;
        if(smsStatus === "received"){
            console.log(JSON.stringify(req.body));
            const isPremiumUser = await checkUserIsPremium(connection,fromNumber);
            const isStopWordExist = await checkStopWords(connection,bodyMessage);
            if(isStopWordExist){
                messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.stopWordText});
            }else{
                if(bodyMessage.toLowerCase() == "hi" || bodyMessage.toLowerCase() == "nextlift" || bodyMessage.toLowerCase() == "next lift" || bodyMessage.toLowerCase() == "hi next lift" || bodyMessage.toLowerCase() == "hi nextlift"){
                    await updateData(connection,t.BOT_REQUESTS,{is_deleted: DELETE_FLAG.TRUE,deleted_at: dateTime},`from_number = '${fromNumber}'`);
                    messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,contentSid: "HX7cb87c6e3679cca43861bc1a121bdad4"});
                    await insertData(connection,t.BOT_REQUESTS,{is_premium: isPremiumUser,from_number: fromNumber,created_at: dateTime,updated_at: dateTime});
                }else{
                    let [botRequest] = await getData(connection,t.BOT_REQUESTS,'*',`from_number = '${fromNumber}' AND is_deleted = ${DELETE_FLAG.FALSE}`);
                    if(botRequest){
                        let botRequestId = botRequest.id;
                        if(!botRequest.state){
                            if(bodyMessage && (bodyMessage.toLowerCase() == "nsw" || buttonPayloadId == "state_nsw")){
                                await updateData(connection,t.BOT_REQUESTS,{state: bodyMessage,updated_at: dateTime},`id = ${botRequestId}`);
                                messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.departureText});
                            }else{
                                messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.stateNotAvailableText});
                            }
                        }else if(!botRequest.latitude && !botRequest.longitude){
                            if(messageType == "location" && latitude && longitude){
                                if(fromNumber.includes("+91")){
                                    latitude = "-33.818759";
                                    longitude = "151.235297";
                                }
                                let updateParms = {latitude,longitude,updated_at: dateTime};
                                let stops = await fetchStops("coord",`${longitude}%3A${latitude}%3AEPSG%3A4326`);
                                if(stops.length){
                                    updateParms.departure_stop_id = stops[0].id;
                                    updateParms.departure = stops[0].name;
                                }
                                await updateData(connection,t.BOT_REQUESTS,updateParms,`id = ${botRequestId}`);
                                messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.destinationText});
                            }else{
                                messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.invalidLocationText});
                            }
                        }else if(!botRequest.destination){
                            let updateParms = {destination: bodyMessage,updated_at: dateTime};
                            let stops = await fetchStops("any",bodyMessage);
                            if(stops.length){
                                updateParms.destination_stop_id = stops[0].id;
                            }
                            await updateData(connection,t.BOT_REQUESTS,updateParms,`id = ${botRequestId}`);
                            messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,contentSid: "HXd127680918ff815f9f7c6058f1657cdf"});
                        }else if(!botRequest.source){
                            if(bodyMessage && (bodyMessage.toLowerCase() == "bus" || bodyMessage.toLowerCase() == "train")){
                                await updateData(connection,t.BOT_REQUESTS,{source: bodyMessage.toLowerCase(),updated_at: dateTime},`id = ${botRequestId}`);
                                let date = moment.tz("Australia/Sydney").format("YYYYMMDD");
                                let time = moment.tz("Australia/Sydney").format("HHmm");
                                let trips = await fetchTrip(date,time,'any',botRequest.departure_stop_id,'any',botRequest.destination_stop_id);
                                if(trips.length){
                                    let mtextValue = await prepareRouteTrip(trips);
                                    await updateData(connection,t.BOT_REQUESTS,{output_response: JSON.stringify(trips[0])},`id = ${botRequestId}`);
                                    await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: mtextValue});
                                    messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,contentSid: "HX40235f747ff24b701e16dc4ebc8bec70"});
                                }else{
                                    messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.tripNotFound});
                                }
                            }else{
                                messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.invalidOption});
                            }
                        }else{
                            if(buttonPayloadId == "msg_option_thanks"){
                                messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,contentSid: "HX5acf0920e39b2a9944339ccdae070f28"});
                            }else if(buttonPayloadId == "msg_option_take_me_there"){
                                if(isPremiumUser && botRequest.output_response){
                                    let mapLink = prepareRouteMap(JSON.parse(botRequest.output_response));
                                    if(mapLink){
                                        let msgBody = `${messages.chatbot.safeTripText}\n\nRoute Map: ${mapLink}`;
                                        messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: msgBody});
                                    }else{
                                        messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.safeTripText});
                                    }
                                }else{
                                    messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.safeTripText});
                                }
                            }else if(buttonPayloadId == "thanks_option_yes"){
                                await updateData(connection,t.BOT_REQUESTS,{is_deleted: DELETE_FLAG.TRUE,deleted_at: dateTime},`id = ${botRequestId}`);
                                messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,contentSid: "HX7cb87c6e3679cca43861bc1a121bdad4"});
                                await insertData(connection,t.BOT_REQUESTS,{is_premium: isPremiumUser,from_number: fromNumber,created_at: dateTime,updated_at: dateTime});
                            }else if(buttonPayloadId == "thanks_option_no"){
                                messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.safeTripText});
                            }
                        }
                    }else{
                        messageObj = await client.messages.create({from: `whatsapp:${CHATBOT.TWILIO_FROM_NUMBER}`,to: fromNumber,body: messages.chatbot.invalidText});
                    }
                }
            }
            if(messageObj){
                res.status(API_STATUS.SUCCESS).send(`${messages.chatbot.success} SID: ${messageObj.sid}`);
            }
        }
    }catch(e){
        console.log(e);
    }finally{
        if(connection){
            connection.release();
        }
    }
}
const callbackMessage = async(req,res) => {
    let connection;
    try{
        connection = await db.getConnectionAsync();
        console.log('Webhook event received:',JSON.stringify(req.body));
        const dateTime = (await helpers.dateConvertToUTC()).totalDate;
        if(req.body.entry){
            for(const entry of req.body.entry){
                if(entry.changes){
                    for(const change of entry.changes){
                        if(change.value.messages){
                            for(const message of change.value.messages){
                                let isPremiumUser = await checkUserIsPremium(connection,message.from);
                                let bodyMsgObj = await handleIncomingMessage(message);
                                if(bodyMsgObj){
                                    const isStopWordExist = await checkStopWords(connection,bodyMsgObj.message);
                                    if(isStopWordExist){
                                        await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,text: {body: messages.chatbot.stopWordText}});
                                    }else{
                                        if(bodyMsgObj.message.toLowerCase() == "hi" || bodyMsgObj.message.toLowerCase() == "nextlift" || bodyMsgObj.message.toLowerCase() == "next lift" || bodyMsgObj.message.toLowerCase() == "hi next lift" || bodyMsgObj.message.toLowerCase() == "hi nextlift"){
                                            await updateData(connection,t.BOT_REQUESTS,{is_deleted: DELETE_FLAG.TRUE,deleted_at: dateTime},`from_number = '${message.from}'`);
                                            await insertData(connection,t.BOT_REQUESTS,{is_premium: isPremiumUser,from_number: message.from,created_at: dateTime,updated_at: dateTime});
                                            await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,type: "template",template: {name: "nextlift_welcome_text",language: {code: "en_US"}}});
                                        }else{
                                            let [botRequest] = await getData(connection,t.BOT_REQUESTS,'*',`from_number = '${message.from}' AND is_deleted = ${DELETE_FLAG.FALSE}`);
                                            if(botRequest){
                                                let botRequestId = botRequest.id;
                                                if(!botRequest.state){
                                                    if(bodyMsgObj.message && bodyMsgObj.message.toLowerCase() == "nsw"){
                                                        await updateData(connection,t.BOT_REQUESTS,{state: bodyMsgObj.message,updated_at: dateTime},`id = ${botRequestId}`);
                                                        await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,type: "template",template: {name: "nextlift_departure_text",language: {code: "en_US"}}});
                                                    }else{
                                                        await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,text: {body: messages.chatbot.stateNotAvailableText}});
                                                    }
                                                }else if(!botRequest.latitude && !botRequest.longitude){
                                                    if(bodyMsgObj.type == "location" && bodyMsgObj.latitude && bodyMsgObj.longitude){
                                                        if(message.from.startsWith("91") || message.from.startsWith("+91")){
                                                            bodyMsgObj.latitude = "-33.818759";
                                                            bodyMsgObj.longitude = "151.235297";
                                                        }
                                                        let updateParms = {latitude: bodyMsgObj.latitude,longitude: bodyMsgObj.longitude,updated_at: dateTime};
                                                        let location = `${bodyMsgObj.longitude}%3A${bodyMsgObj.latitude}%3AEPSG%3A4326`;
                                                        let stops = await fetchStops("coord",location);
                                                        if(stops.length){
                                                            updateParms.departure_stop_id = stops[0].id;
                                                            updateParms.departure = stops[0].name;
                                                        }
                                                        await updateData(connection,t.BOT_REQUESTS,updateParms,`id = ${botRequestId}`);
                                                        await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,type: "template",template: {name: "nextlift_destination_text",language: {code: "en_US"}}});
                                                    }else{
                                                        await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,text: {body: messages.chatbot.invalidLocationText}});
                                                    }
                                                }else if(!botRequest.destination){
                                                    let updateParms = {destination: bodyMsgObj.message,updated_at: dateTime};
                                                    let stops = await fetchStops("any",bodyMsgObj.message);
                                                    if(stops.length){
                                                        updateParms.destination_stop_id = stops[0].id;
                                                    }
                                                    await updateData(connection,t.BOT_REQUESTS,updateParms,`id = ${botRequestId}`);
                                                    await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,type: "template",template: {name: "nextlift_transport_text",language: {code: "en_US"}}});
                                                }else if(!botRequest.source){
                                                    if(bodyMsgObj.message && (bodyMsgObj.message.toLowerCase() == "bus" || bodyMsgObj.message.toLowerCase() == "train")){
                                                        await updateData(connection,t.BOT_REQUESTS,{source: bodyMsgObj.message.toLowerCase(),updated_at: dateTime},`id = ${botRequestId}`);
                                                        let date = moment.tz("Australia/Sydney").format("YYYYMMDD");
                                                        let time = moment.tz("Australia/Sydney").format("HHmm");
                                                        let trips = await fetchTrip(date,time,'any',botRequest.departure_stop_id,'any',botRequest.destination_stop_id);
                                                        if(trips.length){
                                                            let mtextValue = await prepareRouteTrip(trips);
                                                            await updateData(connection,t.BOT_REQUESTS,{output_response: JSON.stringify(trips[0])},`id = ${botRequestId}`);
                                                            await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,text: {body: mtextValue}});
                                                            await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,type: "template",template: {name: "nextlift_msg_button_text",language: {code: "en_US"}}});
                                                        }
                                                    }else{
                                                        await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,text: {body: messages.chatbot.invalidOption}});
                                                    }
                                                }else{
                                                    if(bodyMsgObj.type == "button"){
                                                        if(bodyMsgObj.message == "Thanks"){
                                                            await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,type: "template",template: {name: "nextlift_thanks_text",language: {code: "en_US"}}});
                                                        }else if(bodyMsgObj.message == "Take me there!"){
                                                            if(isPremiumUser && botRequest.output_response){
                                                                let mapLink = prepareRouteMap(JSON.parse(botRequest.output_response));
                                                                if(mapLink){
                                                                    let msgBody = `${messages.chatbot.safeTripText}\n\nRoute Map: ${mapLink}`;
                                                                    await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,text: {body: msgBody}});
                                                                }else{
                                                                    await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,text: {body: messages.chatbot.safeTripText}});
                                                                }
                                                            }else{
                                                                await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,text: {body: messages.chatbot.safeTripText}});
                                                            }
                                                            
                                                        }else if(bodyMsgObj.message == "Yes please"){
                                                            await updateData(connection,t.BOT_REQUESTS,{is_deleted: DELETE_FLAG.TRUE,deleted_at: dateTime},`id = ${botRequestId}`);
                                                            await insertData(connection,t.BOT_REQUESTS,{is_premium: isPremiumUser,from_number: message.from,created_at: dateTime,updated_at: dateTime});
                                                            await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,type: "template",template: {name: "nextlift_welcome_text",language: {code: "en_US"}}});
                                                        }else if(bodyMsgObj.message == "No thanks"){
                                                            await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,text: {body: messages.chatbot.safeTripText}});
                                                        }
                                                    }
                                                }
                                            }else{
                                                await sendWhatsAppMessage({messaging_product: "whatsapp",to: message.from,text: {body: messages.chatbot.invalidText}});
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        res.status(API_STATUS.SUCCESS).send('EVENT_RECEIVED');
    }catch(e){
        console.log(e);
    }finally{
        if(connection){
            connection.release();
        }
    }
}
const verifyToken = async(req,res) => {
    try{
        console.log("Verify Token",req.query);
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];
        if(mode && token){
            if(mode === 'subscribe' && token === CHATBOT.FB_VERIFY_TOKEN){
                console.log('Webhook verified!');
                res.status(API_STATUS.SUCCESS).send(challenge);
            }else{
                res.sendStatus(API_STATUS.FORBIDDEN);
            }
        }else{
            res.sendStatus(API_STATUS.FORBIDDEN);
        }
    }catch(e){
        console.log(e);
    }
}
const handleIncomingMessage = async(messageObj) => {
    if(messageObj.type == "text"){
        return {type: "text",message: messageObj.text.body};
    }else if(messageObj.type == "button"){
        return {type: "button",message: messageObj.button.payload};
    }else if(messageObj.type == "location"){
        return {type: "location",latitude: messageObj.location.latitude,longitude: messageObj.location.longitude,message: ""};
    }
    return null;
}
const sendWhatsAppMessage = async(bodyParams) => {
    try{
        const reqHeaders = {headers: {Authorization: `Bearer ${CHATBOT.FB_ACCESS_TOKEN}`,'Content-Type': 'application/json'}};
        await axios.post(`https://graph.facebook.com/${CHATBOT.FB_VERSION}/${CHATBOT.FB_SENDER_ID}/messages`,bodyParams,reqHeaders);
        console.log('Message sent successfully');
    }catch(e){
        console.error('Error sending message:',e.response ? e.response.data : e.message);
    }
}
const fetchStops = async(type,location) => {
    try{
        const reqHeaders = {headers: {Authorization: `apikey ${CHATBOT.NSW_API_KEY}`,accept: 'application/json'}};
        const response = await axios.get(`https://api.transport.nsw.gov.au/v1/tp/stop_finder?outputFormat=rapidJSON&type_sf=${type}&name_sf=${location}&coordOutputFormat=EPSG%3A4326&TfNSWSF=true&version=10.2.1.42`,reqHeaders);
        return response.data.locations || [];
    }catch(e){
        console.error('Error fetch Stops:',e.response ? e.response.data : e.message);
    }
    return [];
}
const fetchTrip = async(date,time,departureType,departureLocation,destinationType,destinationLocation) => {
    try{
        const reqHeaders = {headers: {Authorization: `apikey ${CHATBOT.NSW_API_KEY}`,accept: 'application/json'}};
        const response = await axios.get(`https://api.transport.nsw.gov.au/v1/tp/trip?outputFormat=rapidJSON&coordOutputFormat=EPSG%3A4326&depArrMacro=dep&itdDate=${date}&itdTime=${time}&type_origin=${departureType}&name_origin=${departureLocation}&type_destination=${destinationType}&name_destination=${destinationLocation}&calcNumberOfTrips=6&exclMOT_7=1&exclMOT_9=1&exclMOT_11=1&TfNSWTR=true&version=10.2.1.42&itOptionsActive=1&cycleSpeed=16`,reqHeaders);
        return response.data.journeys || [];
    }catch(e){
        console.error('Error fetch Trip:',e.response ? e.response.data : e.message);
    }
    return [];
}
const prepareRouteTrip = async(trips) => {
    let tripText = ["🛤️ *Here is your Journey plan* 🛤️"];
    const trip = trips[0];
    for(let i=0;i<trip.legs.length;i++){
        const legObj = trip.legs[i];
        let departureTime = moment.utc(legObj.origin.departureTimeBaseTimetable).tz("Australia/Sydney").format("hh:mm A");
        let arrivalTime = moment.utc(legObj.destination.arrivalTimeBaseTimetable).tz("Australia/Sydney").format("hh:mm A");
        if(legObj.transportation.product.class == 100){
            tripText.push(`🚶 *Walk*\n📍 *From:* ${legObj.origin.disassembledName}\n📍 *To:* ${legObj.destination.disassembledName}\n⏳ *Time:* ${legObj.duration/60} min (${legObj.distance}m)\n🕐 *Departure:* ${departureTime}\n🕒 *Arrival:* ${arrivalTime}\n`);
        }else if(legObj.transportation.product.class == 1){
            tripText.push(`🚆 *Train* - Line ${legObj.transportation.disassembledName}\n📍 *From:* ${legObj.origin.disassembledName}\n📍 *To:* ${legObj.destination.disassembledName}\n🚏 *Stops:* ${legObj.stopSequence.length}\n🕐 *Departure:* ${departureTime}\n🕒 *Arrival:* ${arrivalTime}\n`);
        }else if(legObj.transportation.product.class == 2){
            tripText.push(`🚇 *Metro* - Line ${legObj.transportation.disassembledName}\n📍 *From:* ${legObj.origin.disassembledName}\n📍 *To:* ${legObj.destination.disassembledName}\n🚏 *Stops:* ${legObj.stopSequence.length}\n🕐 *Departure:* ${departureTime}\n🕒 *Arrival:* ${arrivalTime}\n`);
        }else if(legObj.transportation.product.class == 4){
            tripText.push(`🚈 *Light Rail* - Line ${legObj.transportation.disassembledName}\n📍 *From:* ${legObj.origin.disassembledName}\n📍 *To:* ${legObj.destination.disassembledName}\n🚏 *Stops:* ${legObj.stopSequence.length}\n🕐 *Departure:* ${departureTime}\n🕒 *Arrival:* ${arrivalTime}\n`);
        }else if(legObj.transportation.product.class == 5){
            tripText.push(`🚌 *Bus* - Route ${legObj.transportation.disassembledName}\n📍 *From:* ${legObj.origin.disassembledName}\n📍 *To:* ${legObj.destination.disassembledName}\n🚏 *Stops:* ${legObj.stopSequence.length}\n🕐 *Departure:* ${departureTime}\n🕒 *Arrival:* ${arrivalTime}\n`);
        }
    }
    return tripText.join("\n\n");
}
const prepareRouteMap = (trip) => {
    let mapCoords = [];
    if(trip.legs.length){
        mapCoords.push(`https://www.google.com/maps/dir/`);
        for(let i=0;i<trip.legs.length;i++){
            const legObj = trip.legs[i];
            let coord = `${legObj.origin.coord[0]},${legObj.origin.coord[1]}/`;
            if(!mapCoords.includes(coord)){
                mapCoords.push(coord)
            }
        }
    }
    return mapCoords.join("");
}
module.exports = {
    receiveMessages,
    callbackMessage,
    verifyToken
}