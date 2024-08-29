const express = require('express');
const router = express.Router();
const batchInfoModel = require('../models/batchInfoModel');
const resultModel = require('../models/resultModel');
const interfaceModel = require('../models/interfaceModel');

router.get('/', async (req, res) => {
  try {
    const results = await resultModel.getAllResults();
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await resultModel.createResult(req.body.data);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/results', async (req, res) => {
  const { inslot, batch, material, plant, operationno } = req.query;
  try {
      const results = await resultModel.getResultsByCriteria(inslot, batch, material, plant, operationno);
      res.json(results);
  } catch (err) {
      res.status(500).send(err.message);
  }
});

// New route to handle data sent from the Predict system
router.post('/predict-result', async (req, res) => {
  try {
    const final_data = req.body;

    // Insert into batch_info table
    await batchInfoModel.createBatchInfo({
      inslot: final_data.inslot,
      material: final_data.material,
      batch: final_data.batch,
      plant: final_data.plant,
      operationno: final_data.operationno,
    });

    // Insert into result table
    await resultModel.createResult({
      inslot: final_data.inslot,
      material: final_data.material,
      batch: final_data.batch,
      plant: final_data.plant,
      operationno: final_data.operationno,
      good: final_data.class_counts.good,
      honey: final_data.class_counts.honey,
      rotten: final_data.class_counts.rotten,
      insect: final_data.class_counts.insect,
      corncob: final_data.class_counts.corncob,
      goodcracked: final_data.class_counts.goodcracked,
      coated: final_data.class_counts.coated,
      infungus: final_data.class_counts.infungus,
      damaged: final_data.class_counts.damaged,
      exfungus: final_data.class_counts.exfungus,
      whfungus: final_data.class_counts.whfungus,
      badlycracked: final_data.class_counts.badlycracked,
      total_count: final_data.total_count,
    });

    // Insert into interface table
    await interfaceModel.addInterface(
      final_data.inslot,
      final_data.material,
      final_data.batch,
      final_data.plant,
      final_data.operationno,
      final_data.mic_values.phys0003,
      final_data.mic_values.phys0004,
      final_data.mic_values.phys0005,
      final_data.mic_values.phys0006,
      final_data.mic_values.phys0007,
      final_data.mic_values.phys0008,
      final_data.mic_values.phys0009
    );

    res.status(201).json({ message: 'Data inserted successfully' });
  } catch (err) {
    console.error("Error inserting data:", err);
    res.status(500).send(err.message);
  }
});

module.exports = router;