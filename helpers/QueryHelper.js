module.exports = {
    /**
     * insert data
     * @param {*} connection
     * @param {*} table
     * @param {*} data
     * @returns
     */
    async insertData(connection,table,data){
        try{
            return await connection.queryAsync(`INSERT INTO ${table} SET ?`,{...data});
        }catch(error){
            throw error;
        }
    },
    /**
     * update data
     * @param {*} connection
     * @param {*} table
     * @param {*} data
     * @param {*} condition
     * @returns
     */
    async updateData(connection,table,data,condition){
        try{
            return await connection.queryAsync(`UPDATE ${table} SET ? WHERE ${condition}`,{...data});
        }catch(error){
            throw error;
        }
    },
    /**
     * delete data
     * @param {*} connection
     * @param {*} table
     * @param {*} condition
     * @returns
     */
    async deleteData(connection,table,condition){
        try{
            return await connection.queryAsync(`DELETE FROM ${table} WHERE ${condition}`);
        }catch(e){
            throw e;
        }
    },
    /**
     * get data
     * @param {*} connection
     * @param {*} table
     * @param {*} columns
     * @param {*} condition
     * @returns
     */
    async getData(connection,table,columns,condition){
        try{
            columns = columns ? columns : "*";
            return await connection.queryAsync(`SELECT ${columns} FROM ${table} WHERE ${condition}`);
        }catch(error){
            throw error;
        }
    },
    /**
     * get data with Params
     * @param {*} connection
     * @param {*} table
     * @param {*} columns
     * @param {*} condition
     * @param {*} params
     * @returns
     */
    async getDataByParams(connection,table,columns,condition,params){
        try{
            columns = columns ? columns : "*";
            return await connection.queryAsync(`SELECT ${columns} FROM ${table} WHERE ${condition}`,[...params]);
        }catch(error){
            throw error;
        }
    }
}