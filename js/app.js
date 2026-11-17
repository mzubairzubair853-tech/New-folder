// ===== BGNU Attendance System - FIXED: Only Selected Student + Subject =====

let students = JSON.parse(localStorage.getItem("studentList") || '["Ahmed","Ali","Sara"]');
let studentRolls = JSON.parse(localStorage.getItem("studentRolls") || '{}');
let studentPass = JSON.parse(localStorage.getItem("studentPass") || '{}');
let subjects = ["ICT","Programming","English","Math","Physics"];
let currentSubject = localStorage.getItem("currentSubject") || "ICT";
let lectures = JSON.parse(localStorage.getItem("lecturesDB") || "[]");
let today = new Date().toLocaleDateString();
let todayData = {};

function saveStudents(){
  localStorage.setItem("studentList", JSON.stringify(students));
  localStorage.setItem("studentRolls", JSON.stringify(studentRolls));
  localStorage.setItem("studentPass", JSON.stringify(studentPass));
}
function saveLectures(){ localStorage.setItem("lecturesDB", JSON.stringify(lectures)); }
function showToast(msg){
  let t = document.getElementById("toast");
  if(!t) return;
  t.innerText = msg;
  t.style.display = "block";
  setTimeout(()=>{ t.style.display = "none"; }, 3000);
}
function loginAsTeacher(){
  let pass = document.getElementById("userPass").value;
  if(pass === "1234"){ window.location.href = "teacher.html"; }
  else { showToast("❌ Teacher Password is Wrong! Try: 1234"); }
}
function loginAsStudent(){
  let name = document.getElementById("userName").value.trim();
  let pass = document.getElementById("userPass").value.trim();
  if(!name){ showToast("Please Enter Your Name"); return; }
  if(!pass){ showToast("Please Enter Your Password"); return; }
  if(studentPass[name] && studentPass[name] !== pass){ showToast("❌ Password is Wrong!"); return; }
  if(!studentPass[name]){
    studentPass[name] = pass;
    if(!students.includes(name)) students.push(name);
    saveStudents();
  }
  localStorage.setItem("currentStudent", name);
  window.location.href = "student.html";
}
function goHome(){ window.location.href = "index.html"; }
function addStudent(){
  let name = document.getElementById("newStudentName").value.trim();
  let roll = document.getElementById("newStudentRoll").value.trim();
  if(!name){ showToast("Enter Student Name"); return; }
  if(students.includes(name)){ showToast("Student Already Exists"); return; }
  students.push(name);
  if(roll) studentRolls[name] = roll;
  saveStudents();
  document.getElementById("newStudentName").value = "";
  document.getElementById("newStudentRoll").value = "";
  showToast("✅ " + name + " Added Successfully");
  renderTeacher();
}
function deleteStudent(name){
  if(confirm("Do you want to delete " + name + "?")){
    students = students.filter(s => s !== name);
    saveStudents();
    renderTeacher();
  }
}
function changeSubject(){
  currentSubject = document.getElementById("subjectSelect").value;
  localStorage.setItem("currentSubject", currentSubject);
  todayData = {};
  // FIXED: Fix box subject also follows main subject
  let fixSub = document.getElementById("fixSubjectSelect");
  if(fixSub) fixSub.value = currentSubject;
  renderTeacher();
  renderHistory();
  updateFixInfo();
}
function loadTeacherPage(){
  document.getElementById("todayDate").innerText = "Today's Date: " + today;
  let sel = document.getElementById("subjectSelect");
  if(sel) sel.value = currentSubject;
  let fixSub = document.getElementById("fixSubjectSelect");
  if(fixSub) fixSub.value = currentSubject;
  renderTeacher();
  renderHistory();
  renderResetDropdown();
  renderFixDropdown();
  updateFixInfo();
}
function getLectureCount(sub){
  return lectures.filter(l => l.subject === sub).length;
}
function getStudentLectureCount(name, sub){
  return lectures.filter(l => l.subject === sub && l.data[name]).length;
}
function getStudentPresentCount(name, sub){
  return lectures.filter(l => l.subject === sub && l.data[name] === "P").length;
}
function renderTeacher(){
  let title = document.getElementById("subjectTitle");
  if(title) title.innerText = "BSIT - " + currentSubject + " - Section A";
  let lecNo = getLectureCount(currentSubject) + 1;
  let lecInfo = document.getElementById("lectureInfo");
  if(lecInfo) lecInfo.innerText = "Lecture No: " + lecNo + " - " + currentSubject + " - Mark Attendance For This Lecture | Total Lectures: " + (lecNo-1);
  let html = "";
  students.forEach(name => {
    let st = todayData[name] || "-";
    let roll = studentRolls[name] ? "Roll: "+studentRolls[name]+" | " : "";
    let label = st=='P' ? "Present ✅" : st=='A' ? "Absent ❌" : "Pending...";
    let color = st=='P' ? "green" : st=='A' ? "red" : "gray";
    html += `<div class="student-row"><div><b>${name}</b><br><small>${roll}</small><br><small style="color:${color}">${label}</small></div><div><button class="btnP ${st=='P'?'active':''}" onclick="markAtt('${name}','P')">P</button> <button class="btnA ${st=='A'?'active':''}" onclick="markAtt('${name}','A')">A</button> <button onclick="resetStudentFromList('${name}')" title="Reset ${name}" style="width:45px; background:#ff9800; padding:10px;">🔄</button> <button onclick="deleteStudent('${name}')" style="width:40px; background:#999; padding:10px;">✕</button></div></div>`;
  });
  let listEl = document.getElementById("studentList");
  if(listEl) listEl.innerHTML = html;
  let done = Object.keys(todayData).length;
  let statusEl = document.getElementById("todayStatus");
  if(statusEl){
    if(done >= students.length && students.length > 0){
      statusEl.innerText = "✅ Lecture " + lecNo + " Ready To Save";
      statusEl.style.background = "#c8e6c9";
    } else {
      statusEl.innerText = "⏳ " + currentSubject + " - Lecture " + lecNo + " - Marked: " + done + "/" + students.length;
      statusEl.style.background = "#ffccbc";
    }
  }
  renderResetDropdown();
  renderFixDropdown();
  updateFixInfo();
}
function markAtt(name, status){ todayData[name] = status; renderTeacher(); }
function saveAttendance(){
  if(Object.keys(todayData).length === 0){ showToast("Please Mark Attendance First"); return; }
  let now = new Date();
  let newLecture = { subject: currentSubject, date: today, time: now.toLocaleTimeString(), data: {...todayData}, type: "normal" };
  lectures.push(newLecture);
  saveLectures();
  let lecNo = getLectureCount(currentSubject);
  showToast("✅ Lecture " + lecNo + " Saved! Total Lectures Now: " + lecNo);
  todayData = {};
  renderTeacher();
  renderHistory();
}
function startNewLecture(){
  todayData = {};
  renderTeacher();
  showToast("🆕 New Lecture Started - Old History Safe");
}

// ===== FIX ONE STUDENT - ONLY THAT STUDENT + THAT SUBJECT =====
function renderFixDropdown(){
  let sel = document.getElementById("fixStudentSelect");
  if(!sel) return;
  let cur = sel.value;
  // FIXED: Show name + his lectures of current Fix Subject, so dropdown never looks empty
  let fixSubEl = document.getElementById("fixSubjectSelect");
  let fixSub = fixSubEl ? fixSubEl.value : currentSubject;
  sel.innerHTML = `<option value="">-- Select Student --</option>`;
  students.forEach(name => {
    let cnt = getStudentLectureCount(name, fixSub);
    sel.innerHTML += `<option value="${name}">${name} - ${fixSub}: ${cnt} Lec</option>`;
  });
  if(cur && students.includes(cur)) sel.value = cur;
}
// Live Preview - Shows what will happen BEFORE you press Add
function updateFixInfo(){
  let info = document.getElementById("fixInfo");
  if(!info) return;
  let subEl = document.getElementById("fixSubjectSelect");
  let stuEl = document.getElementById("fixStudentSelect");
  let statusEl = document.getElementById("fixStatusSelect");
  if(!subEl || !stuEl || !statusEl) return;
  let sub = subEl.value;
  let name = stuEl.value;
  let status = statusEl.value;
  // Keep dropdown labels fresh when subject changes
  let cur = stuEl.value;
  if(students.length > 0){
    // Rebuild only if needed to update Lec counts, but keep selection
    let temp = stuEl.value;
    renderFixDropdown();
    stuEl.value = temp;
    name = stuEl.value;
  }
  if(!name){
    info.innerText = "👆 Pehle Student Select Karein - Uske baad uski attendance dikhegi";
    info.style.background = "#fff3cd";
    return;
  }
  let total = getStudentLectureCount(name, sub);
  let present = getStudentPresentCount(name, sub);
  let per = total > 0 ? Math.round((present/total)*100) : 0;
  let newTotal = total + 1;
  let newPresent = present + (status === "P" ? 1 : 0);
  let newPer = Math.round((newPresent/newTotal)*100);
  let statusText = status === "P" ? "Present ✅" : "Absent ❌";
  info.innerText = `${name} - ${sub}: Abhi Total ${total}, Present ${present} (${per}%)  →  Add 1 ${statusText} ke baad: Total ${newTotal}, Present ${newPresent} (${newPer}%) - Sirf ${name} ki ${sub} barhegi`;
  info.style.background = "#e8f5e9";
}
function addOneLecture(){
  let sub = document.getElementById("fixSubjectSelect").value;
  let name = document.getElementById("fixStudentSelect").value;
  let status = document.getElementById("fixStatusSelect").value;
  if(!name){ showToast("Please Select A Student First"); return; }
  let now = new Date();
  // CRITICAL: Only this ONE student gets entry, in ONLY this ONE subject
  // Others are NOT in this lecture object, so their Total will NOT increase
  let newLecture = { subject: sub, date: today, time: now.toLocaleTimeString(), data: {}, type: "manual-add" };
  newLecture.data[name] = status;
  lectures.push(newLecture);
  saveLectures();
  let total = getStudentLectureCount(name, sub);
  let present = getStudentPresentCount(name, sub);
  showToast("✅ " + name + " - " + sub + " - 1 Lecture Added! Now Total: " + total + " Present: " + present + " - Others Same");
  renderTeacher();
  renderHistory();
}
function removeOneLecture(){
  let sub = document.getElementById("fixSubjectSelect").value;
  let name = document.getElementById("fixStudentSelect").value;
  if(!name){ showToast("Please Select A Student First"); return; }
  for(let i = lectures.length - 1; i >= 0; i--){
    if(lectures[i].subject === sub && lectures[i].data[name]){
      let removedStatus = lectures[i].data[name];
      if(Object.keys(lectures[i].data).length === 1){
        lectures.splice(i, 1);
      } else {
        delete lectures[i].data[name];
      }
      saveLectures();
      let total = getStudentLectureCount(name, sub);
      showToast("✅ " + name + " - " + sub + " - 1 Lecture Removed (" + (removedStatus==="P"?"Present":"Absent") + ") - Now Total: " + total);
      renderTeacher();
      renderHistory();
      return;
    }
  }
  showToast("❌ No Lecture Found For " + name + " in " + sub);
}

// ===== RESET =====
function renderResetDropdown(){
  let sel = document.getElementById("resetStudentSelect");
  if(!sel) return;
  let currentVal = sel.value;
  sel.innerHTML = `<option value="">-- Select One Student To Reset --</option>`;
  students.forEach(name => {
    let count = lectures.filter(l => l.data[name]).length;
    sel.innerHTML += `<option value="${name}">${name} - Total Lectures: ${count}</option>`;
  });
  if(currentVal) sel.value = currentVal;
}
function resetStudentFromList(name){
  if(confirm("Reset Attendance of " + name + "? His/Her attendance will become 0. Others will stay safe. Are you sure?")){
    doResetOneStudent(name);
  }
}
function resetOneStudent(){
  let sel = document.getElementById("resetStudentSelect");
  let name = sel ? sel.value : "";
  if(!name){ showToast("Please Select A Student First"); return; }
  if(confirm("Reset Attendance of " + name + "? His/Her attendance will become 0. Are you sure?")){
    doResetOneStudent(name);
  }
}
function doResetOneStudent(name){
  lectures.forEach(lec => { delete lec.data[name]; });
  lectures = lectures.filter(lec => Object.keys(lec.data).length > 0);
  saveLectures();
  if(todayData[name]) delete todayData[name];
  renderTeacher();
  renderHistory();
  showToast("✅ " + name + " Attendance Reset - Now 0% - Others Safe");
}
function resetAllAttendance(){
  if(lectures.length === 0){ showToast("Attendance Already 0"); return; }
  if(confirm("Are you SURE? This will delete ALL Students Attendance of ALL Subjects and start from ZERO!")){
    if(confirm("Final Confirmation: All Attendance Will Be Deleted. Continue?")){
      lectures = [];
      todayData = {};
      saveLectures();
      renderTeacher();
      renderHistory();
      showToast("✅ All Attendance Reset - Everyone Now 0%");
    }
  }
}
function renderHistory(){
  let hEl = document.getElementById("historyList");
  let hSub = document.getElementById("historySubject");
  if(hSub) hSub.innerText = currentSubject;
  if(!hEl) return;
  let myLectures = lectures.filter(l => l.subject === currentSubject);
  if(myLectures.length === 0){
    hEl.innerHTML = `<p style="color:#999; text-align:center; padding:15px;">No History Yet. Save Lecture 1 First.</p>`;
    return;
  }
  let html = "";
  myLectures.slice().reverse().forEach((lec, idx) => {
    let realNo = myLectures.length - idx;
    let presentCount = Object.values(lec.data).filter(v => v=="P").length;
    let totalCount = Object.keys(lec.data).length;
    let detail = "";
    Object.keys(lec.data).forEach(n => {
      detail += `<span style="display:inline-block; background:${lec.data[n]=="P"?"#e8f5e9":"#ffebee"}; padding:4px 8px; margin:2px; border-radius:8px; font-size:12px;">${n}: ${lec.data[n]=="P"?"✅ P":"❌ A"}</span> `;
    });
    let tag = lec.type === "manual-add" ? `<span style="background:#e3f2fd; padding:2px 8px; border-radius:10px; font-size:11px;">Manual Fix</span>` : "";
    html += `<div style="border:1px solid #eee; border-radius:12px; padding:12px; margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between;"><b>Lecture ${realNo} - ${lec.subject} ${tag}</b><b>${presentCount}/${totalCount} Present</b></div>
      <small style="color:#888;">${lec.date} - ${lec.time}</small><br>
      <div style="margin-top:8px;">${detail}</div>
    </div>`;
  });
  hEl.innerHTML = html;
}
function showMemeLoader(){
  let loader = document.getElementById("refreshLoader");
  if(loader) loader.style.display = "flex";
}
function hideMemeLoader(){
  let loader = document.getElementById("refreshLoader");
  if(loader) loader.style.display = "none";
}
function refreshToday(){
  showMemeLoader();
  setTimeout(()=>{
    lectures = JSON.parse(localStorage.getItem("lecturesDB") || "[]");
    renderTeacher();
    renderHistory();
    hideMemeLoader();
    showToast("✅ Refreshed! History Safe - Nothing Deleted");
  }, 2000);
}
function loadStudentPage(){
  let name = localStorage.getItem("currentStudent") || "Student";
  let nameEl = document.getElementById("studentNameTop");
  if(nameEl) nameEl.innerText = name;
  let rollEl = document.getElementById("studentRollTop");
  if(rollEl && studentRolls[name]) rollEl.innerText = "Roll No: " + studentRolls[name] + " | BSIT Student";
  updateStudentUI(name);
}
function updateStudentUI(name){
  lectures = JSON.parse(localStorage.getItem("lecturesDB") || "[]");
  let total = 0, present = 0;
  let subjectHTML = "";
  subjects.forEach(sub => {
    // FIXED: Count ONLY lectures where THIS student has entry - so Manual Fix for Zubair does NOT increase Ahmed
    let my = lectures.filter(l => l.subject === sub && l.data[name]);
    let subTotal = my.length;
    let subPresent = my.filter(l => l.data[name] === "P").length;
    let per = subTotal > 0 ? Math.round((subPresent/subTotal)*100) : 0;
    total += subTotal; present += subPresent;
    let barColor = per >= 75 ? "green" : "red";
    if(subTotal === 0) barColor = "#ccc";
    subjectHTML += `<div style="padding:14px 0; border-bottom:1px solid #eee">
      <div style="display:flex; justify-content:space-between"><b>${sub}</b><b style="color:${barColor}">${per}%</b></div>
      <div class="progress-bg"><div class="progress-fill" style="width:${per}%; background:${barColor}"></div></div>
      <div style="display:flex; justify-content:space-between; background:#f8f9fa; padding:8px 10px; border-radius:8px; margin-top:8px; font-size:14px;">
        <span>📖 Total Lectures: <b>${subTotal}</b></span>
        <span>✅ Attended: <b style="color:green">${subPresent}</b></span>
        <span>❌ Missed: <b style="color:red">${subTotal - subPresent}</b></span>
      </div>
      <small>You have attended ${subPresent} out of ${subTotal} lectures of ${sub}</small>
    </div>`;
  });
  let overall = total > 0 ? Math.round((present/total)*100) : 0;
  document.getElementById("totalLec").innerText = total;
  document.getElementById("presentLec").innerText = present;
  document.getElementById("absentLec").innerText = total - present;
  let perEl = document.getElementById("percentText");
  if(perEl){ perEl.innerText = overall + "%"; perEl.style.color = overall >= 75 ? "green" : "red"; }
  let bar = document.getElementById("progressBar");
  if(bar){ bar.style.width = overall + "%"; bar.style.background = overall >= 75 ? "green" : "red"; }
  let statusEl = document.getElementById("attStatus");
  if(statusEl){
    statusEl.innerText = overall >= 75 ? "Safe ✅ - Your Attendance is Good" : "Warning ❌ - Low Attendance, Attend Classes";
    statusEl.style.color = overall >= 75 ? "green" : "red";
  }
  let warnEl = document.getElementById("examWarning");
  if(warnEl){
    if(overall >= 75){
      warnEl.innerText = "✅ Congratulations! Your Attendance is " + overall + "%, You Can Sit in Exams";
      warnEl.style.background = "#d4edda"; warnEl.style.color = "#155724";
    } else {
      warnEl.innerText = "⚠️ Danger! Your Attendance is " + overall + "%. If it is below 75%, you will NOT be allowed to sit in Exams!";
      warnEl.style.background = "#f8d7da"; warnEl.style.color = "#721c24";
    }
  }
  let lastLecture = lectures.filter(l => l.data[name]).slice(-1)[0];
  let todaySt = lastLecture ? lastLecture.data[name] : null;
  document.getElementById("todayAtt").innerText = todaySt=="P" ? "Present ✅" : todaySt=="A" ? "Absent ❌" : "Not Marked Yet ⏳";
  document.getElementById("subjectList").innerHTML = subjectHTML;
}
function refreshStudent(){
  showMemeLoader();
  setTimeout(()=>{
    let name = localStorage.getItem("currentStudent");
    updateStudentUI(name);
    hideMemeLoader();
    showToast("✅ Refresh Done! New Attendance Loaded");
  }, 2000);
}