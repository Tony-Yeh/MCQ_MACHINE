let questions = [];
let currentQuestionIndex = 0;
let selectedSubject = '';

const years = ['108', '109', '110', '111', '112'];

const subjectNames = {
    "testquestions": "測試",
    "GenLawI_CAIP": "憲法、行政法、國際公法、國際私法",
    "GenLawI_CCE": "刑法、刑事訴訟法、法律倫理",
    "GenLawII_CP": "民法、民事訴訟法",
    "GenLawII_CIBSE": "公司法、保險法、票據法、證券交易法、強制執行法、法學英文"
};

function calculateCountdown() {
    const now = new Date();
    const firstExamDate = new Date(now.getFullYear(), 7, 3); // 一試日期： 113年8月3日（月份從0開始計算）
    const secondExamDate = new Date(now.getFullYear(), 9, 19); // 二試日期：113年10月19,20日

    const countdown1 = Math.ceil((firstExamDate - now) / (1000 * 60 * 60 * 24));
    const countdown2 = Math.ceil((secondExamDate - now) / (1000 * 60 * 60 * 24));

    document.getElementById('countdown1').textContent = countdown1 >= 0 ? countdown1 + "天" : "結束";
    document.getElementById('countdown2').textContent = countdown2 >= 0 ? countdown2 + "天" : "結束";
}

document.addEventListener('DOMContentLoaded', function() {
    calculateCountdown();
});

document.addEventListener('keydown', function(event) {
    const quizContainer = document.getElementById('quiz-container');
    const choices = document.getElementsByName('choice');
    if (quizContainer.style.display === 'block') {
        if (event.key === 'ArrowRight') {
            loadNextQuestion();
        } else if (event.key === 'ArrowLeft') {
            loadPreviousQuestion();
        } else if (event.key === 'Enter') {
            checkAnswer();
        } else if (choices[0].disabled == false && event.key === 'ArrowUp') {
            const selectedOptions = document.querySelectorAll('input[name="choice"]:checked');
            if (selectedOptions.length === 0) {
                document.getElementById('choice0').checked = true;
            }
            else {
                if (document.getElementById('choice0').checked) {
                    document.getElementById('choice0').checked = false;
                    document.getElementById('choice3').checked = true;
                } else if (document.getElementById('choice1').checked) {
                    document.getElementById('choice1').checked = false;
                    document.getElementById('choice0').checked = true;
                } else if (document.getElementById('choice2').checked) {
                    document.getElementById('choice2').checked = false;
                    document.getElementById('choice1').checked = true;
                } else if (document.getElementById('choice3').checked) {
                    document.getElementById('choice3').checked = false;
                    document.getElementById('choice2').checked = true;
                }
            }
        } else if (choices[0].disabled == false && event.key === 'ArrowDown') {
            const selectedOptions = document.querySelectorAll('input[name="choice"]:checked');
            if (selectedOptions.length === 0) {
                const lastOptionIndex = document.getElementsByName('choice').length - 1;
                document.getElementById(`choice${lastOptionIndex}`).checked = true;
            }
            else {
                if (document.getElementById('choice0').checked) {
                    document.getElementById('choice0').checked = false;
                    document.getElementById('choice1').checked = true;
                } else if (document.getElementById('choice1').checked) {
                    document.getElementById('choice1').checked = false;
                    document.getElementById('choice2').checked = true;
                } else if (document.getElementById('choice2').checked) {
                    document.getElementById('choice2').checked = false;
                    document.getElementById('choice3').checked = true;
                } else if (document.getElementById('choice3').checked) {
                    document.getElementById('choice3').checked = false;
                    document.getElementById('choice0').checked = true;
                }
            }
        }
    }
});

function loadSubjectForTest(subject) {
    document.getElementById('viewIncorrectBtn').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';
    document.getElementById('backBtn').onclick = function() {
        document.getElementById('subject-container').style.display = 'block';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('backBtn').style.display = 'none';
        document.getElementById('prevBtn').style.display = 'none';
        document.getElementById('nextBtn').style.display = 'none';
        document.getElementById('viewIncorrectBtn').style.display = 'block';
    };
    fetch(`question/${subject}.json`)
    .then(response => response.json())
    .then(data => {
        questions = data;
        shuffleArray(questions); // 題序隨機打亂，不按照原本試題的順序出題
        currentQuestionIndex = 0;
        document.getElementById('subject-container').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';

        const friendlyName = subjectNames[subject] || "未知科目";
        document.getElementById('subject-name').textContent = friendlyName;
        document.getElementById('question-count').textContent = `題數：${currentQuestionIndex + 1} / ${questions.length}`;
        loadQuestion();
    })
    .catch(error => console.error('Error loading questions:', error));
}

function loadSubject(subject) {
    document.getElementById('viewIncorrectBtn').style.display = 'none';
    document.getElementById('backBtn').style.display = 'block';
    document.getElementById('backBtn').onclick = function() {
        document.getElementById('subject-container').style.display = 'block';
        document.getElementById('year-container').style.display = 'none';
        document.getElementById('backBtn').style.display = 'none';
        document.getElementById('viewIncorrectBtn').style.display = 'block';
    };

    selectedSubject = subject; // 儲存選擇的科目
    document.getElementById('subject-container').style.display = 'none';
    document.getElementById('year-container').style.display = 'block';
    generateYearButtons();

    // 顯示當前已選擇的科目名稱
    const friendlyName = subjectNames[subject] || "未知科目";
    document.getElementById('selected-subject').textContent = friendlyName;
}

function generateYearButtons() {
    const container = document.getElementById('year-buttons');
    container.innerHTML = '';
    years.forEach(year => {
        const button = document.createElement('button');
        button.textContent = year + '年';
        button.className = 'year-button';
        button.onclick = () => loadYearQuestions(year);
        container.appendChild(button);
    });
}

function showBackButtonForYearSelection() {
    document.getElementById('backBtn').style.display = 'block';
    document.getElementById('backBtn').onclick = function() {
        document.getElementById('subject-container').style.display = 'block';
        document.getElementById('year-container').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'none';
        document.getElementById('backBtn').style.display = 'none';
        document.getElementById('viewIncorrectBtn').style.display = 'block';
    };
}

function loadYearQuestions(year) {
    const subjectFile = `${selectedSubject}_${year}.json`;
    fetch(`question/${subjectFile}`)
    .then(response => response.json())
    .then(data => {
        questions = data;
        shuffleArray(questions); // 題序隨機打亂，不按照原本試題的順序出題
        currentQuestionIndex = 0;
        document.getElementById('subject-container').style.display = 'none';
        document.getElementById('year-container').style.display = 'none';
        document.getElementById('quiz-container').style.display = 'block';
        document.getElementById('backBtn').style.display = 'block';
        document.getElementById('backBtn').onclick = function() {
            document.getElementById('year-container').style.display = 'block';
            document.getElementById('quiz-container').style.display = 'none';
            showBackButtonForYearSelection(); // 確保在返回選擇年份頁面時顯示並設置回到上一頁按鈕
            document.getElementById('prevBtn').style.display = 'none';
            document.getElementById('nextBtn').style.display = 'none';
        };
        const friendlyName = subjectNames[selectedSubject] || "未知科目";
        document.getElementById('subject-name').textContent = `${year}年 ${friendlyName}`;
        document.getElementById('question-count').textContent = `題數：${currentQuestionIndex + 1} / ${questions.length}`;
        loadQuestion();
    })
    .catch(error => console.error('Error loading questions:', error));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion();
        document.getElementById('question-count').textContent = `題數：${currentQuestionIndex + 1} / ${questions.length}`;
    }
    updateNavigationButtons();
}

function updateNavigationButtons() {
    if (currentQuestionIndex > 0) {
        document.getElementById('prevBtn').style.display = 'block';
    } else {
        document.getElementById('prevBtn').style.display = 'none';
    }

    if (currentQuestionIndex < questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'block';
        document.getElementById('nextBtn').textContent = '下一題';
        document.getElementById('nextBtn').onclick = loadNextQuestion;
    } else if (currentQuestionIndex === questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'block';
        document.getElementById('nextBtn').textContent = '完成';
        document.getElementById('nextBtn').onclick = function() {
            document.getElementById('quiz-container').style.display = 'none';
            document.getElementById('subject-container').style.display = 'block';
            document.getElementById('viewIncorrectBtn').style.display = 'block';
            document.getElementById('backBtn').style.display = 'none';
            document.getElementById('prevBtn').style.display = 'none';
            document.getElementById('nextBtn').style.display = 'none';
            document.getElementById('nextBtn').textContent = '下一題';
            document.getElementById('nextBtn').onclick = loadNextQuestion;
        };
    } else {
        document.getElementById('nextBtn').style.display = 'none';
    }
}

function loadQuestion() {
    const questionData = questions[currentQuestionIndex];
    document.getElementById('question').textContent = questionData.question;
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';
    const optionLabels = ['(A) ', '(B) ', '(C) ', '(D) '];
    questionData.options.forEach((option, index) => {
        const choiceItem = document.createElement('li');
        choiceItem.className = 'choice';
        choiceItem.innerHTML = `
            <input type="radio" name="choice" value="${index}" id="choice${index}">
            <label for="choice${index}">${optionLabels[index]}${option}</label>
        `;
        choicesContainer.appendChild(choiceItem);
    });

    const resultElement = document.getElementById('result');
    resultElement.textContent = '';
    document.getElementById('submit').style.display = 'block';

    if (currentQuestionIndex < questions.length - 1) {
        document.getElementById('nextBtn').style.display = 'block';
    } else {
        document.getElementById('nextBtn').style.display = 'none';
    }

    if (questionData.userChoices) {
        questionData.userChoices.forEach(choiceIndex => {
            document.getElementById(`choice${choiceIndex}`).checked = true;
        });
        checkAnswer();
    }
}

function checkAnswer() {
    const questionData = questions[currentQuestionIndex];
    const correctAnswers = Array.isArray(questionData.answer_index) ? questionData.answer_index : [questionData.answer_index];
    const choices = document.getElementsByName('choice');
    let selectedValues = [];
    for (const choice of choices) {
        if (choice.checked) {
            selectedValues.push(parseInt(choice.value, 10));
        }
    }

    // Store incorrect answers in localStorage
    if (selectedValues.length > 0 && !selectedValues.some(val => correctAnswers.includes(val))) {
        storeIncorrectQuestion(questionData);
    }

    // 儲存用戶的選擇到題目資料中
    questionData.userChoices = selectedValues;

    const resultElement = document.getElementById('result');
    if (selectedValues.length > 0) {
        for (const choice of choices) {
            choice.disabled = true;
        }

        document.getElementById('submit').style.display = 'none';

        const isCorrect = selectedValues.some(selectedValue => correctAnswers.includes(selectedValue));
        if (isCorrect) {
            resultElement.textContent = "恭喜你，答對了！";
            resultElement.style.color = "green";
        } else {
            const optionLabels = ['(A) ', '(B) ', '(C) ', '(D) '];
            resultElement.textContent = "答錯了，正解：" + correctAnswers.map(index => optionLabels[index]).join(" 或 ");
            resultElement.style.color = "red";
        }
        
        correctAnswers.forEach(index => {
            const label = document.querySelector(`label[for="choice${index}"]`);
            if (!label.innerHTML.includes('✔️')) {
                label.style.backgroundColor = "#d4edda"; // 正確答案背景色
                label.innerHTML = `<span style="color: green;">✔️</span> ${label.innerHTML}`;
            }
        });
        selectedValues.forEach(index => {
            const label = document.querySelector(`label[for="choice${index}"]`);
            if (!correctAnswers.includes(index)) {
                if (!label.innerHTML.includes('❌')) {
                    label.style.backgroundColor = "#f8d7da"; // 錯誤答案背景色
                    label.innerHTML = `<span style="color: red;">❌</span> ${label.innerHTML}`;
                }
            }
        });
    } else {
        resultElement.textContent = "請選擇一個答案。";
        resultElement.style.color = "orange";
    }
}

function storeIncorrectQuestion(questionData) {
    let incorrectQuestions = JSON.parse(localStorage.getItem('incorrectQuestions')) || [];
    const { question, options, answer_index } = questionData;
    const incorrectQuestion = {
        Subject:  document.getElementById('subject-name').textContent,
        question,
        options,
        answer_index
    };

    // Check if question already exists in incorrectQuestions
    const exists = incorrectQuestions.some(q => q.question === incorrectQuestion.question);
    if (!exists) {
        incorrectQuestions.push(incorrectQuestion);
        localStorage.setItem('incorrectQuestions', JSON.stringify(incorrectQuestions));
    }
}

function loadIncorrectQuestions() {
    const container = document.getElementById('incorrect-questions-list');
    container.innerHTML = '';
    const incorrectQuestions = JSON.parse(localStorage.getItem('incorrectQuestions')) || [];

    for (let i = incorrectQuestions.length - 1; i >= 0; i--) {
        const question = incorrectQuestions[i];
        const questionElement = document.createElement('div');
        questionElement.innerHTML = `
            <p style="font-weight: bold; font-size: 18px;">${question.Subject}</p>
            <p style="font-size: 16px; margin-top: 10px;">${incorrectQuestions.length - i}. ${question.question}</p>
            <ul style="list-style-type: none; padding: 0; margin: 10px 0;">
                ${question.options.map((option, idx) => `<li>(${String.fromCharCode(65 + idx)}) ${option}</li>`).join('')}
            </ul>
            <p style="color: green; font-weight: bold;">正確答案為： (${String.fromCharCode(65 + question.answer_index)})</p>
            <button onclick="removeIncorrectQuestion(${i})" style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; text-align: center; font-size: 16px; cursor: pointer; border-radius: 5px;">✔️</button>
        `;
        container.appendChild(questionElement);
    };
}

function removeIncorrectQuestion(index) {
    let incorrectQuestions = JSON.parse(localStorage.getItem('incorrectQuestions')) || [];
    incorrectQuestions.splice(index, 1);
    localStorage.setItem('incorrectQuestions', JSON.stringify(incorrectQuestions));
    filterIncorrectQuestions();
}

function filterIncorrectQuestions() {
    const filter = document.getElementById('subject-filter').value;
    const incorrectQuestions = JSON.parse(localStorage.getItem('incorrectQuestions')) || [];
    const filteredQuestions = [];
    const filteredIndexes = [];

    incorrectQuestions.forEach((q, index) => {
        const subjectName = q.Subject.split(' ')[1]; // 提取科目名稱部分
        if (filter === 'all' || subjectName === subjectNames[filter]) {
            filteredQuestions.push(q);
            filteredIndexes.push(index);
        }
    });

    displayIncorrectQuestions(filteredQuestions, filteredIndexes);
}

function displayIncorrectQuestions(questions, indexs) {
    const container = document.getElementById('incorrect-questions-list');
    container.innerHTML = '';
    if(questions.length == 0) {
        const noMatch = document.createElement('div');
        noMatch.innerHTML = '<p style="text-align: center; color: grey;">無匹配項目</p>';
        container.appendChild(noMatch);
    }

    for (let i = questions.length - 1; i >= 0; i--) {
        const question = questions[i];
        const questionElement = document.createElement('div');
        questionElement.innerHTML = `
            <p style="font-weight: bold; font-size: 18px;">${question.Subject}</p>
            <p style="font-size: 16px; margin-top: 10px;">${questions.length - i}. ${question.question}</p>
            <ul style="list-style-type: none; padding: 0; margin: 10px 0;">
                ${question.options.map((option, idx) => `<li>(${String.fromCharCode(65 + idx)}) ${option}</li>`).join('')}
            </ul>
            <p style="color: green; font-weight: bold;">正確答案為： (${String.fromCharCode(65 + question.answer_index)})</p>
            <button onclick="removeIncorrectQuestion(${indexs[i]})" style="background-color: #4CAF50; color: white; border: none; padding: 10px 20px; text-align: center; font-size: 16px; cursor: pointer; border-radius: 5px;">✔️</button>
        `;
        container.appendChild(questionElement);
    }
}

document.getElementById('viewIncorrectBtn').addEventListener('click', function() {
    document.getElementById('subject-container').style.display = 'none';
    document.getElementById('viewIncorrectBtn').style.display = 'none';
    document.getElementById('incorrect-questions-container').style.display = 'block';
    document.getElementById('backBtn').style.display = 'block';
    document.getElementById('backBtn').onclick = function() {
        document.getElementById('subject-container').style.display = 'block';
        document.getElementById('viewIncorrectBtn').style.display = 'block';
        document.getElementById('incorrect-questions-container').style.display = 'none';
        document.getElementById('backBtn').style.display = 'none';
    };
    document.getElementById("subject-filter").value = "all";
    loadIncorrectQuestions();
});

function loadNextQuestion() {
    if (currentQuestionIndex >= questions.length - 1) {
        document.getElementById('nextBtn').textContent = '完成';
        document.getElementById('nextBtn').onclick = function() {
            document.getElementById('quiz-container').style.display = 'none';
            document.getElementById('subject-container').style.display = 'block';
            document.getElementById('backBtn').style.display = 'none';
            document.getElementById('prevBtn').style.display = 'none';
            document.getElementById('nextBtn').style.display = 'none';
            document.getElementById('nextBtn').textContent = '下一題';
            document.getElementById('nextBtn').onclick = loadNextQuestion;
        };
    } else {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            document.getElementById('question-count').textContent = `題數：${currentQuestionIndex + 1} / ${questions.length}`;
            loadQuestion();
        }
    }
    updateNavigationButtons();
}