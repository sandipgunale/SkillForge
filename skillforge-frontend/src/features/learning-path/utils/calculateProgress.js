export function calculateProgress(
roadmap
){

if(!roadmap?.weeks){

return{

completedWeeks:0,

totalWeeks:0,

progress:0,

};

}

const totalWeeks=
roadmap.weeks.length;

const completedWeeks=
roadmap.weeks.filter(
week=>week.completed
).length;

return{

completedWeeks,

totalWeeks,

progress:
completedWeeks/
totalWeeks*100,

};

}