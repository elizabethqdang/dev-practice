const express = require('express') // function 
const router = express.Router();

const Question = require('../../models/question')

router.get('/', (req, res) => { 
	const ids = []
	Question.find()
		.then(questions => { 
			questions.forEach(res.json(questions))
			.catch(err => res.status(404).json(err))
})