const fs = require('fs');
const path = 'assets/data/seed_materials.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// 1. Fix Standard 5 Mathematics Term II paper (was tagged as std_4)
let p36 = data.seed_materials.find(m => m.id === 'pp_std_4_standard_5_mathematics_term_ii');
if (p36) {
  p36.grade_key = 'std_5';
  p36.title = 'Standard 5 Mathematics Term II Examination';
  p36.type = 'PAST_PAPER_SAMPLE';
  console.log('Fixed p36 grade_key to std_5');
}

// 2. Enhance Standard 5 Mathematics Term 1 Evaluation Test questions
let pMath5 = data.seed_materials.find(m => m.id === 'pp_std_5_maths_5_end_of_february_its_a_');
if (pMath5) {
  pMath5.title = 'Standard 5 Mathematics Term 1 Evaluation Test';
  pMath5.type = 'PAST_PAPER_SAMPLE';
  pMath5.questions = [
    {
      id: 'std5_math_q1',
      prompt: 'Work out: 3.5 × 10',
      options: ['35', '0.35', '350', '3.50'],
      correct_index: 0,
      explanation: 'When multiplying a decimal by 10, move the decimal point one place to the right: 3.5 × 10 = 35.'
    },
    {
      id: 'std5_math_q2',
      prompt: 'Mr. Tau had 9,005 cows. He bought 89 more the following year. How many cows does he have now?',
      options: ['9,094', '9,100', '9,084', '9,895'],
      correct_index: 0,
      explanation: '9,005 + 89 = 9,094 cows.'
    },
    {
      id: 'std5_math_q3',
      prompt: 'What is 5,326 expressed in expanded form?',
      options: [
        '5 × 1000 + 3 × 100 + 2 × 10 + 6',
        '5 × 10,000 + 3 × 100 + 2 × 10 + 6',
        '5 × 100 + 3 × 10 + 2 × 1 + 6',
        '5 × 1000 + 3 × 10 + 2 × 100 + 6'
      ],
      correct_index: 0,
      explanation: '5 thousands (5 × 1000) + 3 hundreds (3 × 100) + 2 tens (2 × 10) + 6 units (6 × 1).'
    },
    {
      id: 'std5_math_q4',
      prompt: 'Convert 3,980 thebe into Pula.',
      options: ['P39.80', 'P398.00', 'P3.98', 'P3980.00'],
      correct_index: 0,
      explanation: 'There are 100 thebe in P1. 3,980 ÷ 100 = P39.80.'
    },
    {
      id: 'std5_math_q5',
      prompt: 'Which of the following is a prime number?',
      options: ['17', '15', '21', '9'],
      correct_index: 0,
      explanation: '17 is a prime number because its only factors are 1 and 17.'
    },
    {
      id: 'std5_math_q6',
      prompt: 'What is 17/4 expressed as a mixed fraction?',
      options: ['4 1/4', '4 3/4', '3 1/4', '5 1/4'],
      correct_index: 0,
      explanation: '17 ÷ 4 = 4 with a remainder of 1, giving 4 1/4.'
    },
    {
      id: 'std5_math_q7',
      prompt: 'What is 45/100 expressed as a decimal?',
      options: ['0.45', '4.5', '0.045', '45.0'],
      correct_index: 0,
      explanation: '45 divided by 100 moves the decimal point two places to the left: 0.45.'
    },
    {
      id: 'std5_math_q8',
      prompt: 'Find the lowest common multiple (LCM) of 4 and 6.',
      options: ['12', '24', '2', '18'],
      correct_index: 0,
      explanation: 'Multiples of 4: 4, 8, 12, 16... Multiples of 6: 6, 12, 18... The lowest common multiple is 12.'
    }
  ];
}

// 3. Add Standard 5 English Examination Paper
let hasStd5Eng = data.seed_materials.some(m => m.id === 'pp_std_5_english_2023_exam');
if (!hasStd5Eng) {
  data.seed_materials.unshift({
    id: 'pp_std_5_english_2023_exam',
    subject_id: 'std_english',
    grade_key: 'std_5',
    term: 'Term 2',
    title: 'Standard 5 English Attainment Exam',
    type: 'PAST_PAPER_SAMPLE',
    reading_content: 'Read the following instructions carefully before answering.\n\nEnglish Language examination testing comprehension, vocabulary, antonyms, parts of speech, and sentence construction for Standard 5.',
    questions: [
      {
        id: 'std5_eng_q1',
        prompt: 'Choose the word that is an ANTONYM (opposite) of the word "ancient":',
        options: ['Modern', 'Old', 'Historical', 'Antique'],
        correct_index: 0,
        explanation: '"Modern" means present-day or recent, which is the direct opposite of "ancient" (very old).'
      },
      {
        id: 'std5_eng_q2',
        prompt: 'Identify the noun in the sentence: "The intelligent cheetah runs very quickly across the savanna."',
        options: ['cheetah', 'intelligent', 'runs', 'quickly'],
        correct_index: 0,
        explanation: '"Cheetah" is a noun (naming an animal). "Intelligent" is an adjective, "runs" is a verb, and "quickly" is an adverb.'
      },
      {
        id: 'std5_eng_q3',
        prompt: 'Choose the correct form of the verb: "Neither of the boys ________ ready for the athletics race."',
        options: ['was', 'were', 'are', 'have been'],
        correct_index: 0,
        explanation: '"Neither" takes a singular verb in standard English, so "was" is correct.'
      },
      {
        id: 'std5_eng_q4',
        prompt: 'What is the plural form of the word "child"?',
        options: ['Children', 'Childs', 'Childes', 'Childrens'],
        correct_index: 0,
        explanation: '"Child" has an irregular plural form: "children".'
      },
      {
        id: 'std5_eng_q5',
        prompt: 'Which punctuation mark should end this sentence? "What a wonderful goal Thabo scored"',
        options: ['Exclamation mark (!)', 'Question mark (?)', 'Full stop (.)', 'Comma (,)'],
        correct_index: 0,
        explanation: 'Exclamatory sentences expressing excitement or strong emotion end with an exclamation mark (!).'
      },
      {
        id: 'std5_eng_q6',
        prompt: 'Choose the correct preposition: "Mpho was proud ________ her young sister’s achievements."',
        options: ['of', 'with', 'about', 'on'],
        correct_index: 0,
        explanation: 'The adjective "proud" is followed by the preposition "of": proud of.'
      }
    ]
  });
  console.log('Added Standard 5 English Attainment Exam');
}

// 4. Add Standard 5 Science End of Year Examination
let hasStd5Sci = data.seed_materials.some(m => m.id === 'pp_std_5_science_exam');
if (!hasStd5Sci) {
  data.seed_materials.unshift({
    id: 'pp_std_5_science_exam',
    subject_id: 'std_science',
    grade_key: 'std_5',
    term: 'Term 3',
    title: 'Standard 5 Science End of Year Examination',
    type: 'PAST_PAPER_SAMPLE',
    reading_content: 'Botswana Primary School Curriculum Science Assessment for Standard 5.\n\nTopics covered: Plants, human digestive system, states of matter, and animal habitats.',
    questions: [
      {
        id: 'std5_sci_q1',
        prompt: 'Which part of a plant is primarily responsible for absorbing water and mineral salts from the soil?',
        options: ['Roots', 'Leaves', 'Stem', 'Flowers'],
        correct_index: 0,
        explanation: 'Roots anchor the plant and absorb water and dissolved nutrients from the soil via root hairs.'
      },
      {
        id: 'std5_sci_q2',
        prompt: 'During photosynthesis, what gas do green leaves take in from the atmosphere?',
        options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'],
        correct_index: 0,
        explanation: 'Plants absorb carbon dioxide from the air and release oxygen as a byproduct of photosynthesis.'
      },
      {
        id: 'std5_sci_q3',
        prompt: 'What process occurs when water changes state from a liquid to a gas?',
        options: ['Evaporation', 'Condensation', 'Freezing', 'Melting'],
        correct_index: 0,
        explanation: 'Evaporation is the transition of a liquid into a gas when heat energy increases.'
      },
      {
        id: 'std5_sci_q4',
        prompt: 'Which organ produces bile to aid in the digestion of fats?',
        options: ['Liver', 'Stomach', 'Pancreas', 'Small intestine'],
        correct_index: 0,
        explanation: 'The liver secretes bile, which is stored in the gall bladder and emulsifies fats in the small intestine.'
      }
    ]
  });
  console.log('Added Standard 5 Science End of Year Exam');
}

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully written seed_materials.json!');
