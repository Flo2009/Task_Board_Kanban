// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));
let taskFormEl=$('#task-button');
let taskDisplayEl=$('#task-display');
let taskNameInputEl=$('#task-title');
let taskDescrInputEl=$('#task-text');
let taskDateInputEl=$('#task-due');
let modalTaskinputEl=$('#formModal');

function readTasksFromStorage() {
    //Read out what is in local storage
    taskList = JSON.parse(localStorage.getItem("tasks"));
    //In case there is nothing create an empty array
    if (!taskList) {
      taskList = [];
    }
    return taskList;
  }

//Add event listener to the form element, listen for a submit event, and call the `handleAddTask` function.
taskFormEl.on("click", handleAddTask);

//Deletion of the card by clicking on the delete button
taskDisplayEl.on('click', '.btn-delete-project', handleDeleteTask);

// Todo: create a function to generate a unique task id
function generateTaskId() {
    if (!taskList){
        nextId=0;
    }else if(taskList){
      //use Math.random to create a random number between 0 and 1 to have a unique identifier
        nextId=Math.random();
      }
    
    return nextId;
    
}

// Todo: create a function to create a task card
function createTaskCard(task) {
  //pass all the card attributes to the card
    const newTask=$('<div>')
    .addClass('new-project-card draggable my-3')
    .attr('task', task.id);
    const taskHeader=$('<div>').addClass('task-header h4').text(task.title);
    const taskBody=$('<div>').addClass('task-body');
    const taskDescription=$('<p>').addClass('task-text').text(task.descr);
    const taskDueDate=$('<p>').addClass('task-text').text(task.dueDate);
    //create the delete button on the card
    const taskDeleteButton=$('<button>')
        .addClass('btn btn-danger delete')
        .text('Delete')
        .attr('task', task.id);
    taskDeleteButton.on('click',handleDeleteTask);

    // Set the background of the cards depending on the date and position
  if (task.dueDate && task.status !== 'done') {
    const now = dayjs();
    const dueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

    //If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(dueDate, 'day')) {
      newTask.addClass('bg-warning text-white');
    } else if (now.isAfter(dueDate)) {
      newTask.addClass('bg-danger text-white');
      taskDeleteButton.addClass('border-light');
    }
  }
//append everything to the task card
  taskBody.append(taskDescription, taskDueDate, taskDeleteButton);
  newTask.append(taskHeader, taskBody);

  return newTask;
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {

    //Empty existing task cards out of the lanes
    const todoList = $('#todo-cards');
    todoList.empty();

    const inProgressList = $('#in-progress-cards');
    inProgressList.empty();

    const doneList = $('#done-cards');
    doneList.empty();

    // console.log(taskList);
    //only render in case there is data in the task list
    if (taskList != null){

        taskList.forEach(element => {
            let id=element.id;
           
            let descr=element.descr;
            let dueDate=element.dueDate;
            let title=element.name;
            let status=element.status
            let task={id,descr,dueDate,title, status};
//assign the card to the area depending on the stored status in the localStorage
            if (task.status === 'to-do') {
                todoList.append(createTaskCard(task));
            } else if (task.status === 'in-progress') {
                inProgressList.append(createTaskCard(task));
            } else if (task.status === 'done') {
                doneList.append(createTaskCard(task));
            }
            
        });
    }  
    //make the card draggable and create the effect to make it transperent when moved  
    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        //  This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
        helper: function (e) {
          //  Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
          const original = $(e.target).hasClass('ui-draggable')
            ? $(e.target)
            : $(e.target).closest('.ui-draggable');

          //  Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
          return original.clone().css({
            width: original.outerWidth(),
          });
        },
        
      });

     
}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
    
    event.preventDefault();
    

  // Read user input from the form
  const taskName = taskNameInputEl.val().trim();
  const taskDescr = taskDescrInputEl.val(); 
  const taskDate = taskDateInputEl.val(); 
  const taskId=generateTaskId();

  const addTask = {
    
    id: taskId,
    name: taskName,
    descr: taskDescr,
    dueDate: taskDate,
    status: 'to-do',
    };
    
  // Pull the projects from localStorage and push the new task to the array
  const task = readTasksFromStorage();
  task.push(addTask);

  // Save the updated task array to localStorage
  saveTasksToStorage(task);

  // Render the tasks and display
  renderTaskList();

  //  Clear the form inputs
  taskNameInputEl.val('');
  taskDescrInputEl.val('');
  taskDateInputEl.val('');
  modalTaskinputEl.modal('hide');//hide the form element again

}

function saveTasksToStorage(task) {
    localStorage.setItem('tasks', JSON.stringify(task));
    
  }

// Todo: create a function to handle deleting a task
function handleDeleteTask(event, ui){
    // console.log(this);
    const taskId = $(this).attr('task');//get the attribute from the card element that holds the ID
    const task = readTasksFromStorage();
  
    //  Remove project from the array. 
    task.forEach((elemnt) => {
      if (elemnt.id == taskId) {
        task.splice(task.indexOf(elemnt), 1);
      }
    });
  
    // Save tasks to localStorage
    saveTasksToStorage(task);
  
    // Render everything
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui ) {

    const tasks = readTasksFromStorage();//get the data from localStorage into an array
    let taskId= ui.draggable.attr('task');//get the ID from the element over the ui

    
    
    const newStatus = event.target.id;//get the tageted lane status i.e. "done", "in-progress", "to-do"
    console.log(newStatus);

    for (let project of tasks) {
        // console.log(project.id);
        //  Find the task card by the `id` and update the status.
        if (project.id == taskId) {
          project.status = newStatus;
         }
      }
      //write everything back to local storage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    //render everything
    renderTaskList();



};



// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
//initial rendering
    renderTaskList();
//create the date picker to the form
    $('#task-due').datepicker({
        changeMonth: true,
        changeYear: true,
      });

    //  Make lanes droppable
  $('.lane').droppable({
    // accept: '.draggable',drop
    accept: '.draggable', 
    drop: handleDrop,
  });

});
