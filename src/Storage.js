import Tasks from "./tasks";
import Projects from "./projects";

export default class Storage {
    static tasks = [];
    static projects = [];
    static taskCounter = 0;
    static projectCounter = 0;

    static addTask(task) {
        Storage.tasks.push(task);
        task.id = Storage.taskCounter
        Storage.taskCounter++;
        if(Storage.storageAvailable("localStorage")) {
          localStorage.setItem("taskCounter", JSON.stringify(Storage.taskCounter));
        }
    }

    static addProject(project) {
        Storage.projects.push(project);
        project.id = Storage.projectCounter
        Storage.projectCounter++;
        if(Storage.storageAvailable("localStorage")) {
          localStorage.setItem("projectCounter", JSON.stringify(Storage.projectCounter));
        }
    }

    static getTasks() {
        return Storage.tasks;
    }

    static getProjects() {
        return Storage.projects;
    }

    static getTask(id) {
        return Storage.tasks.filter((task) => task.id == id)[0];
    }

    static getProject(id) {
        return Storage.projects.filter((project) => project.id == id)[0];
    }

    static deleteTask(id) {
        Storage.tasks = Storage.tasks.filter((task) => task.id!= id);
    }

    static deleteProject(id) {
        Storage.projects = Storage.projects.filter((project) => project.id!= id);
    }

    static storageAvailable(type) {
        let storage;
        try {
          storage = window[type];
          const x = "__storage_test__";
          storage.setItem(x, x);
          storage.removeItem(x);
          return true;
        } catch (e) {
          return (
            e instanceof DOMException &&
            // everything except Firefox
            (e.code === 22 ||
              // Firefox
              e.code === 1014 ||
              // test name field too, because code might not be present
              // everything except Firefox
              e.name === "QuotaExceededError" ||
              // Firefox
              e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
            // acknowledge QuotaExceededError only if there's something already stored
            storage &&
            storage.length !== 0
          );
        }
      }

      static clearStorage() {
        localStorage.clear();
      }

      static loadFromStorage() {
        if(Storage.storageAvailable("localStorage")) {
            const temp_tasks = JSON.parse(localStorage.getItem("Tasks"))
            const temp_projects = JSON.parse(localStorage.getItem("Projects"))
            const taskCounterStorage = JSON.parse(localStorage.getItem("taskCounter"))
            const projectCounterStorage = JSON.parse(localStorage.getItem("projectCounter"))

            for (let task of temp_tasks) {
                Object.setPrototypeOf(task, Tasks.prototype)
                Storage.tasks.push(task)
            }
            for (let project of temp_projects) {
                Object.setPrototypeOf(project, Projects.prototype)
                Storage.projects.push(project)
            }

            if(temp_tasks.length == 0) {
              localStorage.setItem("taskCounter", "0") 
            } else {
              Storage.taskCounter = +taskCounterStorage
            }

            if(temp_projects.length == 0) {
              localStorage.setItem("projectCounter", "0")
            } else {
              Storage.projectCounter = +projectCounterStorage
            }
        }
      }
}
