// State Management
let state = {
    members: [],
    currentMonth: new Date().toISOString().slice(0, 7),
    selectedMember: null
};

const addMemberApi = async (member) => {
    try {
        const response = await fetch('../api/member', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(member)
        });
        const res = await response.json();
        console.log(res);
        if (!response.ok) {
            throw new Error(res.message);
        }
    } catch (error) {
        console.error('Error fetching members:', error.message);
    }

    getMembersApi();
};


const getMembersApi = async () => {
    try {
        const response = await fetch('../api/member');
        const res = await response.json();
        console.log(res);
        if (response.ok) {
            state.members = res.data;
        }else{
            console.error('Failed to fetch members:', res.message);
        }
    } catch (error) {
        console.error('Error fetching members:', error.message);
    }

    renderMembers();
};
    

const deleteMemberApi = async (memberId) => {
    try {
        const response = await fetch(`../api/member/${memberId}`, {
            method: 'DELETE'
        });
        const res = await response.json();
        console.log(res);
        if (!response.ok) {
            throw new Error(res.message);
        }
    } catch (error) {
        console.error('Error deleting member:', error.message);
    }

    getMembersApi();
};





// DOM Elements
const membersSection = document.getElementById('members-section');
const tasksSection = document.getElementById('tasks-section');
const membersList = document.getElementById('members-list');
const monthFilter = document.getElementById('month-filter');
const memberFilter = document.getElementById('member-filter');

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.section}-section`).classList.add('active');
    });
});

// Modal Management
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Member Management
document.getElementById('add-member-btn').addEventListener('click', () => {
    document.getElementById('member-form').reset();
    openModal('member-modal');
});

document.getElementById('member-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const member = {
        id: Date.now().toString(),
        name: formData.get('member-name'),
        email: formData.get('member-email'),
        college: formData.get('member-college'),
        year: formData.get('member-year'),
        phone: formData.get('member-phone'),
        // months: []
    };
    
    await addMemberApi(member);
    renderMembers();
    closeModal('member-modal');
});

function renderMembers() {
    


    membersList.innerHTML = state.members.map(member => `
        <div class="member-card">
            <h3>${member.name}</h3>
            <p>${member.college} - Year ${member.year}</p>
            <p>${member.email}</p>
            <p>${member.phone}</p>
            <div class="member-actions">
                <button class="btn secondary" onclick="editMember('${member._id}')">Edit</button>
                <button class="btn danger" onclick="deleteMemberApi('${member._id}')">Delete</button>
                <button class="btn primary" onclick="addMonthToMember('${member._id}')">Add Month</button>
            </div>
        </div>
    `).join('');
    
    // Update member filter
    memberFilter.innerHTML = `
        <option value="">All Members</option>
        ${state.members.map(member => `
            <option value="${member.id}">${member.name}</option>
        `).join('')}
    `;
}

function editMember(memberId) {
    const member = state.members.find(m => m.id === memberId);
    if (!member) return;
    
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-email').value = member.email;
    document.getElementById('member-college').value = member.college;
    document.getElementById('member-year').value = member.year;
    document.getElementById('member-phone').value = member.phone;
    
    openModal('member-modal');
}

function deleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member?')) {
        state.members = state.members.filter(m => m.id !== memberId);
        getMembersApi();
    }
}

// Month Management
document.getElementById('add-month-btn').addEventListener('click', () => {
    if (!state.selectedMember) {
        alert('Please select a member first');
        return;
    }
    document.getElementById('month-form').reset();
    openModal('month-modal');
});

document.getElementById('month-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const monthDate = formData.get('month-date');
    addMonthToMember(state.selectedMember, monthDate);
    closeModal('month-modal');
});

document.getElementById('add-factor-btn').addEventListener('click', () => {
    if (!state.selectedMember) {
        alert('Please select a member first');
        return;
    }
    const member = state.members.find(m => m.id === state.selectedMember);
    const monthData = member.months.find(m => 
        new Date(m.date).toISOString().slice(0, 7) === state.currentMonth
    );
    if (!monthData) {
        alert('No month data found');
        return;
    }
    document.getElementById('month-factor').value = monthData.factor || 1.0;
    openModal('factor-modal');
});

document.getElementById('factor-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const factor = parseFloat(formData.get('month-factor'));
    
    const member = state.members.find(m => m.id === state.selectedMember);
    const monthData = member.months.find(m => 
        new Date(m.date).toISOString().slice(0, 7) === state.currentMonth
    );
    if (monthData) {
        monthData.factor = factor;
        renderTasks();
    }
    closeModal('factor-modal');
});

function addMonthToMember(memberId, monthDate) {
    const member = state.members.find(m => m.id === memberId);
    if (!member) return;

    const date = new Date(monthDate);
    const existingMonth = member.months.find(m => 
        new Date(m.date).toISOString().slice(0, 7) === monthDate
    );

    if (existingMonth) {
        alert('This month already exists for this member');
        return;
    }

    const newMonth = {
        name: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        date: date,
        factor: 1.0,
        weeks: Array(4).fill(null).map((_, i) => ({
            name: `Week ${i + 1}`,
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate() + (i * 7)),
            tasks: []
        }))
    };

    member.months.push(newMonth);
    updateMonthFilter();
    renderTasks();
}

function updateMonthFilter() {
    if (!state.selectedMember) return;

    const member = state.members.find(m => m.id === state.selectedMember);
    if (!member) return;

    monthFilter.innerHTML = member.months.map(month => `
        <option value="${new Date(month.date).toISOString().slice(0, 7)}" 
                ${new Date(month.date).toISOString().slice(0, 7) === state.currentMonth ? 'selected' : ''}>
            ${month.name}
        </option>
    `).join('');
}

monthFilter.addEventListener('change', (e) => {
    state.currentMonth = e.target.value;
    renderTasks();
});

memberFilter.addEventListener('change', (e) => {
    state.selectedMember = e.target.value;
    updateMonthFilter();
    renderTasks();
});

// Task Management
function addTask(memberId, monthIndex, weekIndex) {
    const member = state.members.find(m => m.id === memberId);
    if (!member) return;

    openModal('task-modal');
    const form = document.getElementById('task-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const task = {
            id: Date.now().toString(),
            name: formData.get('task-name'),
            description: formData.get('task-description'),
            startDate: formData.get('task-start-date'),
            endDate: formData.get('task-end-date'),
            points: parseInt(formData.get('task-points')),
            score: 0,
            rate: 0
        };
        
        member.months[monthIndex].weeks[weekIndex].tasks.push(task);
        renderTasks();
        closeModal('task-modal');
    };
}

function evaluateTask(memberId, monthIndex, weekIndex, taskIndex) {
    const member = state.members.find(m => m.id === memberId);
    if (!member) return;

    const task = member.months[monthIndex].weeks[weekIndex].tasks[taskIndex];
    if (!task) return;

    openModal('evaluation-modal');
    const form = document.getElementById('evaluation-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        task.score = parseInt(formData.get('task-score'));
        task.rate = parseInt(formData.get('task-rate'));
        renderTasks();
        closeModal('evaluation-modal');
    };
}

function renderTasks() {
    if (!state.selectedMember) return;

    const member = state.members.find(m => m.id === state.selectedMember);
    if (!member) return;

    const monthData = member.months.find(m => 
        new Date(m.date).toISOString().slice(0, 7) === state.currentMonth
    );
    if (!monthData) {
        document.querySelector('.weeks-container').innerHTML = '<p>No data for this month</p>';
        return;
    }

    const monthIndex = member.months.indexOf(monthData);
    const weeksContainer = document.querySelector('.weeks-container');
    weeksContainer.innerHTML = `
        <div class="month-info">
            <h3>${monthData.name}</h3>
            <p>Factor: ${monthData.factor || 1.0}</p>
        </div>
        ${monthData.weeks.map((week, weekIndex) => `
            <div class="week-card">
                <h3>
                    ${week.name}
                    <button class="btn secondary" onclick="addTask('${member.id}', ${monthIndex}, ${weekIndex})">Add Task</button>
                </h3>
                <div class="task-list">
                    ${week.tasks.map((task, taskIndex) => `
                        <div class="task-item">
                            <h4>${task.name}</h4>
                            <p>${task.description}</p>
                            <div class="task-meta">
                                <div>Start: ${new Date(task.startDate).toLocaleDateString()}</div>
                                <div>End: ${new Date(task.endDate).toLocaleDateString()}</div>
                                <div>Points: ${task.points}</div>
                                ${task.score ? `
                                    <div>Score: ${task.score}</div>
                                    <div>Rate: ${task.rate}</div>
                                    <div>Final Score: ${(task.score * task.rate * (monthData.factor || 1.0)).toFixed(2)}</div>
                                ` : ''}
                            </div>
                            ${!task.score ? `
                                <button class="btn secondary" onclick="evaluateTask('${member.id}', ${monthIndex}, ${weekIndex}, ${taskIndex})">Evaluate</button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    `;
}

// Initialize

getMembersApi();
renderTasks();