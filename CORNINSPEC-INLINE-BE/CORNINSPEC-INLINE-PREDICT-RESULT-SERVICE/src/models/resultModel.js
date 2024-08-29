// models/resultModel.js
const { predictionPool } = require('../config/dbconfig');// Import the shared pool

async function createResult(value) {
    const query = `
        INSERT INTO prediction.result (
            inslot, material, batch, plant, operationno,
            good, honey, rotten, insect, corncob, goodcracked,
            coated, infungus, damaged, exfungus, whfungus, badlycracked, total_count
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *;
    `;
    const values = [
        value.inslot,
        value.material,
        value.batch,
        value.plant,
        value.operationno,
        value.good,          // value.class_counts.good
        value.honey,         // value.class_counts.honey
        value.rotten,        // value.class_counts.rotten
        value.insect,        // value.class_counts.insect
        value.corncob,       // value.class_counts.corncob
        value.goodcracked,   // value.class_counts.goodcracked
        value.coated,        // value.class_counts.coated
        value.infungus,      // value.class_counts.infungus
        value.damaged,       // value.class_counts.damaged
        value.exfungus,      // value.class_counts.exfungus
        value.whfungus,      // value.class_counts.whfungus
        value.badlycracked,  // value.class_counts.badlycracked
        value.total_count
    ];
    const { rows } = await predictionPool.query(query, values);
    return rows[0];
}

async function getResultById(id) {
    const { rows } = await predictionPool.query('SELECT * FROM result WHERE id = $1', [id]);
    return rows[0];
}

async function getAllResults() {
    const { rows } = await predictionPool.query('SELECT * FROM result ORDER BY created_at DESC');
    return rows;
}

async function updateResult(id, newValue) {
    const { rows } = await predictionPool.query('UPDATE result SET value = $1 WHERE id = $2 RETURNING *', [newValue, id]);
    return rows[0];
}

async function deleteResult(id) {
    await predictionPool.query('DELETE FROM result WHERE id = $1', [id]);
}

async function getResultsByCriteria(inslot, batch, material, plant, operationno) {
  const query = `
      SELECT * FROM prediction.result
      WHERE inslot = $1 AND batch = $2 AND material = $3 AND plant = $4 AND operationno = $5;
  `;
  const values = [inslot, batch, material, plant, operationno];
  const { rows } = await predictionPool.query(query, values);
  return rows;
}

module.exports = {
    createResult,
    getResultById,
    getAllResults,
    updateResult,
    deleteResult,
    getResultsByCriteria
};
