const generateRecommendations = (studentData) => {
  const subjects = ['math', 'science', 'english', 'history', 'art'];
  let highestSub = '';
  let highestScore = -1;
  let lowestSub = '';
  let lowestScore = 101;
  
  let totalScore = 0;
  
  // Exclude new/ungraded students
  if (studentData.math === undefined || studentData.math === 0 && studentData.science === 0) {
    return "Once you enter your grades, our AI engine will generate personalized study recommendations for you!";
  }

  subjects.forEach(sub => {
    const score = Number(studentData[sub]) || 0;
    totalScore += score;
    if (score > highestScore) {
      highestScore = score;
      highestSub = sub;
    }
    if (score < lowestScore) {
      lowestScore = score;
      lowestSub = sub;
    }
  });

  const avg = totalScore / 5;
  const studyHours = Number(studentData.studyTimeHours) || 0;

  let recommendation = `You are performing exceptionally well in ${highestSub.charAt(0).toUpperCase() + highestSub.slice(1)}, showing strong aptitude. `;
  
  if (lowestScore < 50) {
    recommendation += `However, your ${lowestSub.charAt(0).toUpperCase() + lowestSub.slice(1)} grade is currently ${lowestScore}%. Consider allocating more of your study time to this subject. `;
  } else if (lowestScore < 75) {
    recommendation += `To boost your overall average, try dedicating a few extra hours to ${lowestSub.charAt(0).toUpperCase() + lowestSub.slice(1)}. `;
  }

  if (studyHours < 10 && avg < 70) {
    recommendation += `You currently study ${studyHours} hours a week. Increasing your weekly study time to at least 15 hours could significantly improve your grades.`;
  } else if (studyHours >= 20 && avg < 60) {
    recommendation += `You are studying a lot (${studyHours} hours), but your grades aren't reflecting it yet. Try changing your study methods, like using active recall or joining a study group!`;
  } else if (studyHours >= 15 && avg >= 80) {
    recommendation += `Your consistent study routine of ${studyHours} hours is paying off beautifully. Keep up the excellent work!`;
  }

  return recommendation;
};

module.exports = {
  generateRecommendations
};
