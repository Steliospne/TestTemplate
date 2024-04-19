export default class Tasks {
    constructor(name, description, dueDate, priority, id, project_id) {
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.id = id;
        this.project_id = project_id;
        this.completed = false;
        this.animation = false;
    }
}
