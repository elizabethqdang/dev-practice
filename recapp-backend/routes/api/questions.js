const express = require('express');
// const { eventNames } = require('../../models/question');
const router = express.Router();

const Question = require('../../models/question')

router.get('/', (req, res) => {
	Question.find()
		.then(questions => res.json(questions))
			.catch(err => res.status(404).json(err))
})

// router.get('/names', (req, res) => { 
// 	const names = []
// 	Question.find()
// 		.then(questions => { 
// 			questions.forEach(question => {
// 				names.push(question.name)
// 			})
// 		}).then(res.json(names))
// 			.catch(err => res.status(404).json(err))
// });	

// const res = {
// 	questions: {

// 	}
// }