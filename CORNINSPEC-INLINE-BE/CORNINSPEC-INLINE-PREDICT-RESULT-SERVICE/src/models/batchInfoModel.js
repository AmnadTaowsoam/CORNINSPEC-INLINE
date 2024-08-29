// models/batchInfoModel.js
const { predictionPool } = require('../config/dbconfig');

const createBatchInfo = async (batchInfo) => {
    const { inslot, material, batch, plant, operationno } = batchInfo;
    const query = `
        INSERT INTO prediction.batch_info (inslot, material, batch, plant, operationno)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (inslot, material, batch, plant, operationno) DO NOTHING
        RETURNING *;
    `;
    const values = [inslot, material, batch, plant, operationno];
    const { rows } = await predictionPool.query(query, values);
    return rows[0];
};

const getBatchInfoByCriteria = async (inslot, material, batch, plant, operationno) => {
    const query = `
        SELECT * FROM prediction.batch_info
        WHERE inslot = $1 AND material = $2 AND batch = $3 AND plant = $4 AND operationno = $5;
    `;
    const values = [inslot, material, batch, plant, operationno];
    const { rows } = await predictionPool.query(query, values);
    return rows[0];
};

module.exports = {
    createBatchInfo,
    getBatchInfoByCriteria,
};

