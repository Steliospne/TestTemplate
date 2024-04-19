import task from "./tasks.js";
import project from "./projects.js";
import Storage from "./Storage.js";
import { format } from "date-fns";

export default class GUI {
    static header = document.querySelector("header");
    static footer = document.querySelector("footer");
    static wrapper = document.querySelector(".display");
    static dialog = document.querySelector("dialog");
    static deleteControl = document.querySelector("#deleteControl");
    static homeBtn = document.querySelector(".home-btn");
    static projectBtn = document.querySelector(".project-btn");
    static addBtn = document.querySelector(".add-btn");
    static cancelBtn = document.querySelector(".cancel");
    static createBtn = document.querySelector(".submit");

    static initApp() {
        GUI.homeBtn.addEventListener("click", (e) => {
            GUI.screenUpdate();
            GUI.createBtnStateReset();
            GUI.navBarButtonState(e);
            GUI.renderTasks(Storage.getTasks());
        });

        GUI.projectBtn.addEventListener("click", (e) => {
            GUI.screenUpdate();
            GUI.createBtnStateReset();
            GUI.navBarButtonState(e);
            GUI.renderProjects(Storage.getProjects());
        });

        GUI.addBtn.addEventListener("click", () => {
            GUI.dialog.showModal();
            GUI.createBtnState();
        });

        GUI.cancelBtn.addEventListener("click", () => {
            GUI.createBtnStateReset();
            GUI.dialog.close();
        });

        GUI.dialog.addEventListener("keydown", (e) => {
            if (e.key == "Escape") {
                if (
                    GUI.createBtnState() == "projTasks" ||
                    GUI.createBtnState() == "editProjectTask"
                )
                    return;
                GUI.createBtnStateReset();
            }
        });

        GUI.createBtn.addEventListener("click", GUI.handleCreateButton);
        GUI.setFormAttribute();
        GUI.renderTasks(Storage.getTasks());
        GUI.footerUpdater();
    }

    static handleCreateButton(e) {
        e.preventDefault();
        const currentState = GUI.createBtnState();
        if (currentState == "home") {
            Storage.addTask(GUI.getInput(new task()));
            GUI.renderTasks(Storage.getTasks());
            GUI.createBtnStateReset();
        } else if (currentState == "project") {
            Storage.addProject(GUI.getInput(new project()));
            GUI.renderProjects(Storage.getProjects());
            GUI.createBtnStateReset();
        } else if (currentState == "editTask") {
            GUI.getInput(Storage.getTask(GUI.createBtn.value));
            GUI.renderTasks(Storage.getTasks());
            GUI.createBtnStateReset();
        } else if (currentState == "editProject") {
            GUI.getInput(Storage.getProject(GUI.createBtn.value));
            GUI.renderProjects(Storage.getProjects());
            GUI.createBtnStateReset();
        } else if (
            currentState == "editProjectTask" &&
            GUI.homeBtn.className.includes("active")
        ) {
            GUI.getInput(Storage.getTask(GUI.createBtn.value));
            GUI.renderTasks(Storage.getTasks());
            GUI.createBtnStateReset();
        } else if (currentState == "editProjectTask") {
            GUI.getInput(Storage.getTask(GUI.createBtn.value));
            GUI.inspectView(Storage.getTasks());
            GUI.createBtnStateReset();
        } else if (currentState == "projTasks") {
            Storage.addTask(GUI.getInput(new task()));
            GUI.inspectView(Storage.getTasks());
        }
        GUI.dialog.close();
    }

    static createBtnState() {
        if (
            GUI.createBtn.className.includes("projTasks") &&
            !GUI.createBtn.className.includes("edit")
        ) {
            GUI.createBtn.textContent = "add Task";
            return "projTasks";
        } else if (
            GUI.createBtn.className.includes("edit") &&
            GUI.createBtn.className.includes("projTasks")
        ) {
            GUI.createBtn.textContent = "edit Task";
            return "editProjectTask";
        } else if (
            GUI.createBtn.className.includes("edit") &&
            GUI.homeBtn.className.includes("active")
        ) {
            GUI.createBtn.textContent = "edit Task";
            return "editTask";
        } else if (
            GUI.createBtn.className.includes("edit") &&
            GUI.projectBtn.className.includes("active")
        ) {
            GUI.createBtn.textContent = "edit Project";
            return "editProject";
        } else if (GUI.homeBtn.className.includes("active")) {
            GUI.createBtn.textContent = "add Task";
            GUI.createBtn.classList.add("task");
            return "home";
        } else if (GUI.projectBtn.className.includes("active")) {
            GUI.createBtn.textContent = "add Project";
            GUI.createBtn.classList.add("project");
            return "project";
        } else {
            GUI.createBtnStateReset();
            return null;
        }
    }
    static createBtnStateReset() {
        GUI.createBtn.className = "submit";
    }

    static renderTasks(tasks) {
        if (!GUI.createBtn.className.includes("projTasks")) {
            GUI.screenUpdate();
        }

        for (let task of tasks) {
            const card = document.createElement("div");
            const name = document.createElement("p");
            const completedButton = document.createElement("input");
            const priority = document.createElement("p");
            const description = document.createElement("button");
            const deleteBtn = document.createElement("button");
            const editBtn = document.createElement("button");
            const dueDateDisplay = document.createElement("p");

            card.classList.add("task-card");
            name.classList.add("task-name");
            completedButton.classList.add(`check-btn${task.id}`);
            description.classList.add("description-btn");
            priority.classList.add("task-priority");
            deleteBtn.classList.add("deleteBtn");
            editBtn.classList.add("editBtn");
            dueDateDisplay.classList.add("due-date");

            name.textContent = task.name;
            completedButton.type = "checkbox";
            priority.innerHTML = `Priority: <span class="priorityDisplay${
                task.id
            }">${task.priority.toUpperCase()}</span>`;
            card.id = task.id;
            dueDateDisplay.textContent =
                task.dueDate == "" ? "Due: - " : `Due: ${task.dueDate}`;
            card.append(
                completedButton,
                name,
                priority,
                dueDateDisplay,
                description,
                editBtn,
                deleteBtn
            );
            GUI.wrapper.append(card);

            const priorityDisplay = document.querySelector(
                `.priorityDisplay${task.id}`
            );
            priorityDisplay.style.fontWeight = "bold";
            if (task.priority == "low") {
                priorityDisplay.style.color = "green";
            } else if (task.priority == "medium") {
                priorityDisplay.style.color = "#f7c566";
            } else {
                priorityDisplay.style.color = "#6c0345";
            }

            completedButton.addEventListener("change", (e) => {
                const card = document.getElementById(
                    `${e.target.parentElement.id}`
                );
                if (e.target.checked) {
                    task.completed = true;

                    for (let node of card.children) {
                        if (node.className == "editBtn")
                            node.setAttribute("disabled", "");

                        node.innerHTML = "<s>" + node.innerHTML + "</s>";
                    }
                } else {
                    task.completed = false;

                    for (let node of card.children) {
                        if (node.className == "editBtn")
                            node.removeAttribute("disabled");

                        node.innerHTML = node.innerHTML.slice(3, -4);
                    }
                }
            });

            description.addEventListener("click", () => {
                const dialog = document.querySelector("dialog#description");
                const wrapper = document.createElement("div");
                const descriptionDisplay = document.createElement("p");
                const backBtn = document.createElement("button");
                const descriptionHeader = document.createElement("h1");
                backBtn.className = "back-btn";
                descriptionDisplay.textContent = task.description;
                descriptionHeader.textContent = "Description";
                wrapper.append(descriptionHeader, descriptionDisplay, backBtn);
                dialog.append(wrapper);
                dialog.show();
                backBtn.addEventListener("click", () => {
                    dialog.close();
                    dialog.textContent = "";
                });
            });

            editBtn.addEventListener("click", (e) => {
                const currentTask = e.target.parentElement.id;
                GUI.createBtn.classList.add("edit");
                GUI.createBtn.value = currentTask;
                GUI.createBtnState();
                GUI.dialog.showModal();
            });

            deleteBtn.addEventListener("click", (e) => {
                GUI.wrapper.removeChild(e.target.parentElement);
                Storage.deleteTask(e.target.parentElement.id);
                if (Storage.storageAvailable("localStorage")) {
                    localStorage.setItem(
                        "Tasks",
                        JSON.stringify(Storage.getTasks())
                    );
                }
            });

            GUI.cardAnimation(task);

            if (Storage.storageAvailable("localStorage")) {
                localStorage.setItem(
                    "Tasks",
                    JSON.stringify(Storage.getTasks())
                );
            }
        }
    }

    static renderProjects(projects) {
        GUI.screenUpdate();
        for (let project of projects) {
            const card = document.createElement("div");
            const name = document.createElement("p");
            const priority = document.createElement("p");
            const inspectBtn = document.createElement("button");
            const description = document.createElement("button");
            const deleteBtn = document.createElement("button");
            const editBtn = document.createElement("button");
            const dueDateDisplay = document.createElement("p");

            card.classList.add("project-card");
            name.classList.add("project-name");
            priority.classList.add("project-priority");
            inspectBtn.classList.add("inspectBtn");
            description.classList.add("description-btn");
            deleteBtn.classList.add("deleteBtn");
            editBtn.classList.add("editBtn");
            dueDateDisplay.classList.add("due-date");

            name.textContent = project.name;
            priority.innerHTML = `Priority: <span class="priorityDisplay${
                project.id
            }">${project.priority.toUpperCase()}</span>`;
            card.id = project.id;
            dueDateDisplay.textContent =
                project.dueDate == "" ? "" : `Due: ${project.dueDate}`;
            card.append(
                name,
                priority,
                dueDateDisplay,
                inspectBtn,
                description,
                editBtn,
                deleteBtn
            );
            GUI.wrapper.append(card);

            const priorityDisplay = document.querySelector(
                `.priorityDisplay${project.id}`
            );
            priorityDisplay.style.fontWeight = "bold";
            if (project.priority == "low") {
                priorityDisplay.style.color = "green";
            } else if (project.priority == "medium") {
                priorityDisplay.style.color = "#f7c566";
            } else {
                priorityDisplay.style.color = "#6c0345";
            }

            inspectBtn.addEventListener("click", (e) => {
                GUI.createBtn.classList.add("projTasks");
                GUI.createBtn.value = e.target.parentElement.id;
                GUI.inspectView(Storage.getTasks());
            });

            description.addEventListener("click", () => {
                const dialog = document.querySelector("dialog#description");
                const wrapper = document.createElement("div");
                const descriptionDisplay = document.createElement("p");
                const backBtn = document.createElement("button");
                const descriptionHeader = document.createElement("h1");
                backBtn.className = "back-btn";
                descriptionDisplay.textContent = project.description;
                descriptionHeader.textContent = "Description";
                wrapper.append(descriptionHeader, descriptionDisplay, backBtn);
                dialog.append(wrapper);
                dialog.show();
                backBtn.addEventListener("click", () => {
                    dialog.close();
                    dialog.textContent = "";
                });
            });

            editBtn.addEventListener("click", (e) => {
                GUI.createBtn.classList.add("edit");
                GUI.createBtn.value = e.target.parentElement.id;
                GUI.createBtnState();
                GUI.dialog.showModal();
            });

            deleteBtn.addEventListener("click", (e) => {
                const submitDelete = document.querySelector(".submit-dlt");
                const cancelDelete = document.querySelector(".cancel-dlt");
                const target = e.target.parentElement;
                GUI.deleteControl.showModal();

                submitDelete.addEventListener("click", () => {
                    deleteCheckHandler(target);
                });

                cancelDelete.addEventListener("click", () => {
                    GUI.deleteControl.close();
                });

                function deleteCheckHandler(target) {
                    e.preventDefault();
                    const projTasks = Storage.getTasks().filter(
                        (task) => task.project_id == project.id
                    );
                    for (let task of projTasks) {
                        Storage.deleteTask(task.id);
                    }
                    target.remove();
                    Storage.deleteProject(target.id);
                    GUI.deleteControl.close();

                    if (Storage.storageAvailable("localStorage")) {
                        localStorage.setItem(
                            "Projects",
                            JSON.stringify(Storage.getProjects())
                        );
                    }
                }
            });
            if (Storage.storageAvailable("localStorage")) {
                localStorage.setItem(
                    "Projects",
                    JSON.stringify(Storage.getProjects())
                );
            }

            GUI.cardAnimation(project);
        }
    }

    static inspectView(tasks) {
        GUI.screenUpdate();
        const projectTitle = document.createElement("h1");
        const backBtn = document.createElement("button");

        GUI.wrapper.append(projectTitle);
        if (GUI.createBtnState() == "editProjectTask") {
            const currentProject = Storage.getTask(
                GUI.createBtn.value
            ).project_id;
            projectTitle.textContent = Storage.getProject(currentProject).name;
            GUI.renderTasks(
                tasks.filter((task) => task.project_id == currentProject)
            );
        } else {
            projectTitle.textContent = Storage.getProject(
                GUI.createBtn.value
            ).name;
            GUI.renderTasks(
                tasks.filter((task) => task.project_id == GUI.createBtn.value)
            );
        }

        backBtn.value = "Back";
        backBtn.className = "back-btn";
        GUI.createBtn.classList.add("projTasks");
        GUI.header.prepend(backBtn);

        backBtn.addEventListener("click", () => {
            GUI.createBtnStateReset();
            GUI.renderProjects(Storage.getProjects());
        });
    }

    static getInput(obj) {
        const name = document.querySelector("#name").value;
        const description = document.querySelector("#description").value;
        const priority = Array.from(
            document.getElementsByName("priority")
        ).filter((radio) => {
            return radio.checked == true;
        })[0].id;
        const dueDate = document.querySelector("#date").value;

        obj.dueDate = dueDate == "" ? "" : format(dueDate, "dd/MM/yyyy");
        obj.name = name;
        obj.description = description;
        obj.priority = priority;

        if (GUI.createBtnState() == "projTasks") {
            obj.project_id = GUI.createBtn.value;
        }

        return obj;
    }

    static setFormAttribute() {
        const name = document.querySelector("input#name");
        const description = document.querySelector("textarea#description");
        const date = document.querySelector("input#date");
        const today = new Date().toISOString().split("T")[0];
        name.setAttribute("maxlength", "20");
        description.setAttribute("maxlength", "200");
        date.setAttribute("min", today);
    }

    static navBarButtonState(e) {
        const target = e.target;
        if (!target.className.includes("active")) {
            GUI.homeBtn.className.includes("active") === true
                ? GUI.homeBtn.classList.remove("active")
                : GUI.homeBtn.classList.add("active");
            GUI.projectBtn.className.includes("active") === true
                ? GUI.projectBtn.classList.remove("active")
                : GUI.projectBtn.classList.add("active");
        }
    }

    static cardAnimation(obj) {
        if (Object.getPrototypeOf(obj) === task.prototype) {
            const card = Array.from(
                document.querySelectorAll(".task-card")
            ).filter((card) => {
                return card.id == obj.id;
            })[0];
            if (obj.animation == false) {
                card.classList.add("animation");
                obj.animation = true;
            } else {
                card.classList.remove("animation");
            }
        } else {
            const card = Array.from(
                document.querySelectorAll(".project-card")
            ).filter((card) => {
                return card.id == obj.id;
            })[0];
            if (obj.animation == false) {
                card.classList.add("animation");
                obj.animation = true;
            } else {
                card.classList.remove("animation");
            }
        }
    }

    static screenUpdate() {
        GUI.wrapper.textContent = "";
        if (GUI.header.firstChild.value == "Back")
            GUI.header.firstChild.remove();
    }

    static footerUpdater() {
        GUI.footer.innerHTML = `Created by <a href="https://github.com/Steliospne"><i class='github-logo'></i> Steliospne </a> © ${new Date().getFullYear()}`;
    }
}
