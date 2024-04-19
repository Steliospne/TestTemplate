export default class Projects {
    constructor(name, description, dueDate, priority, id) {
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.id = id;
        this.completed = false;
        this.animation = false;
    }
}
