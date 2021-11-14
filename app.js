const mysql = require('mysql');
const cTable = require('console.table');
const inquirer = require('inquirer');
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "employee_tracker"
});
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected with id " + connection.threadId);
    // join();
    startManage();
});

function startManage() {
    inquirer
        .prompt([{
            name: 'menu',
            type: 'list',
            message: "  What would you like to do?",
            choices: ['View all employees', 'View all employees by department', 'View employees by manager', 'View all departments', 'View all roles', 'Add department', 'Add role', 'Add employee', 'Update employee Role' ,'exit']
        }])
        .then((answer) => {
            // console.log(answer);
            switch (answer.menu) {
                case "View all employees":
                    viewEmployees();
                    break;
                case "View all employees by department":
                    departmentEmployees();
                    break;
                case "View employees by manager":
                    managerEmployees();
                    break;
                case "View all departments":
                    departments();
                    break;
                case "View all roles":
                    roles();
                    break;
                case "Add department":
                    AddDepartment();
                    break;
                case "Add role":
                    AddRole();
                    break;
                case "Add employee":
                    AddEmployee();
                    break;
                case "Update employee Role":
                    updateEmployeeRole();
                    break;
                case "exit":
                    connection.end();
                    break;
            }
        })
}

function viewEmployees() {
    join();

}

function departmentEmployees() {
    connection.query('SELECT name FROM department', (err, results) => {
        if (err) throw err;
        inquirer
            .prompt([{
                name: 'department',
                type: 'list',
                choices: function () {
                    const departmentArr = [];
                    for (let i = 0; i < results.length; i++) {
                        departmentArr.push(results[i].name);
                    }
                    // console.log(departmentArr);
                    return departmentArr;
                },
                message: 'Choose department to view the employees?'

            }])
            .then((answer) => {
                // console.log(answer);
                const sql = "SELECT a.id, a.first_name, a.last_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT_WS(' ', b.first_name, b.last_name) AS manager FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee AS a ON role.id = a.role_id LEFT JOIN employee AS b ON a.manager_id = b.id WHERE department.name = ?";
                connection.query(sql, [answer.department], function (err, results) {
                    if (err) throw err;
                    // console.log(results);
                    const consoleArr = [];
                    for (let i = 0; i < results.length; i++) {
                        let obj = {
                            id: results[i].id,
                            first_name: results[i].first_name,
                            last_name: results[i].last_name,
                            title: results[i].title,
                            department: results[i].department,
                            salary: results[i].salary,
                            manager: results[i].manager
                        };
                        consoleArr.push(obj);
                    }
                    console.table(consoleArr);
                    startManage();
                })

            })
    })

    // connection.query('SELECT name FROM department', function (err, results) {
    //     console.log(results);
    // })
}

function managerEmployees() {
    connection.query('SELECT CONCAT_WS(" ", employee.first_name, employee.last_name) AS manager FROM employee WHERE employee.manager_id IS NULL', (err, results) => {
        if (err) throw err;
        // console.log(results);
        inquirer
            .prompt([{
                name: 'manager',
                type: "list",
                choices: function () {
                    const managerArr = [];
                    for (let i = 0; i < results.length; i++) {
                        managerArr.push(results[i].manager);
                    }
                    return managerArr;
                },
                message: "choose manager to view the employees?"
            }])
            .then((answer) => {
                // console.log(answer);
                const fullNameArr = answer.manager.split(" ");
                // console.log(fullNameArr);
                let firstName = fullNameArr[0];
                let lastName = fullNameArr[1];
                // console.log(firstName, lastName);

                const sql = "SELECT a.id, a.first_name, a.last_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT_WS(' ', b.first_name, b.last_name) AS manager FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee AS a ON role.id = a.role_id LEFT JOIN employee AS b ON a.manager_id = b.id WHERE b.first_name = ? AND b.last_name = ?";
                connection.query(sql, [firstName,lastName] ,function (err, results) {
                    if (err) throw err;
                    // console.log(results);
                    const consoleArr = [];
                    for (let i = 0; i < results.length; i++) {
                        let obj = {
                            id: results[i].id,
                            first_name: results[i].first_name,
                            last_name: results[i].last_name,
                            title: results[i].title,
                            department: results[i].department,
                            salary: results[i].salary,
                            manager: results[i].manager
                        };
                        consoleArr.push(obj);
                    }
                    console.table(consoleArr);
                    startManage();
                })

            })
    })
}

function departments() {
    connection.query('SELECT * FROM department', (err, results) => {
        if(err) throw err;
        const consoleArr=[];
        for(let i=0; i< results.length; i++) {
            const obj = {departmentId: results[i].id , department: results[i].name};
            consoleArr.push(obj);
        }
        console.table(consoleArr);
        startManage();
        
    })
}

function roles() {
    connection.query('SELECT * FROM role', (err, results) => {
        if(err) throw err;
        const consoleArr=[];
        for(let i=0; i< results.length; i++) {
            const obj = {roleId: results[i].id , title: results[i].title, salary: results[i].salary, department_id: results[i].department_id};
            consoleArr.push(obj);
        }
        console.table(consoleArr);
        startManage();
        
    })
}

function AddDepartment() {
    inquirer
        .prompt([
            {
                name: 'departmentAdd',
                type: 'input',
                message: "Enter the department name to add?"
            }
        ])
        .then((answer) => {
            console.log(answer);
            const sql = "INSERT INTO department SET name= ?";
            connection.query(sql, [answer.departmentAdd], (err, result) => {
                if(err) throw err;
                startManage();
            })
        })
}
function AddRole() {
    connection.query('SELECT name FROM department', (err, results) => {
        if(err) throw err;
        inquirer
            .prompt([
                {
                    name: 'AddRole',
                    type: 'input',
                    message: "what role do you want to add?"
                },
                {
                    name: "AddSalary",
                    type: 'number',
                    message:"Enter the salary for the role?",
                    validate: function(value) {
                        if(isNaN(value)) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                },
                {
                    name: "departmentSelect",
                    type: "list",
                    choices: function() {
                        const departmentArr= [];
                        for(let i=0; i< results.length; i++) {
                            departmentArr.push(results[i].name);
                        }
                        return departmentArr;
                    },
                    message: "what department the role belongs to?"
                 }
            ])
            .then((answer)=> {
                // console.log(answer);
                const sql = 'SELECT id FROM department WHERE name=?';
                connection.query(sql, [answer.departmentSelect], (err, result)=> {
                    const departmentId= result[0].id;
                    // console.log(departmentId);
                    connection.query('INSERT INTO role SET title=?, salary=?, department_id=?', [answer.AddRole, answer.AddSalary, departmentId], (err, result) => {
                        if(err) throw err;
                        startManage();
                    })
                })
            })
    })
}

function AddEmployee() {
    inquirer
        .prompt([
            {
                name: "firstName",
                type: "input",
                message: "what is the employees firstName?"
            },
            {
                name: "lastName",
                type: "input",
                message: "what is the employees last name?"
            }
        ])
        .then((answer) => {
            // console.log(answer);
            const firstName = answer.firstName;
            const lastName = answer.lastName;
            connection.query('SELECT title FROM role', (err, results)=> {
                if(err) throw err;
                inquirer
                    .prompt([
                        {
                            name:'employeeRole',
                            type: "list",
                            choices: function() {
                                const roleArr= [];
                                for(let i=0; i< results.length; i++) {
                                    roleArr.push(results[i].title);
                                }
                                return roleArr;
                            },
                            message: "Choose the role for the employee?"
                        }
                    ])
                    .then((ans)=> {
                        // console.log(ans);
                        connection.query('SELECT id FROM role WHERE title=?', [ans.employeeRole], (err, result)=> {
                            if(err) throw err;
                            // console.log(result);
                            const roleid = result[0].id;
                            connection.query('SELECT CONCAT_WS(" ", first_name, last_name) AS Manager FROM employee WHERE manager_id IS NULL', (err, results)=>{
                                // console.log(results);
                                inquirer
                                    .prompt([
                                        {
                                            name:'managerList',
                                            type: "list",
                                            choices: function() {
                                                const managerArr = [];
                                                for(let i=0; i< results.length; i++) {
                                                    managerArr.push(results[i].Manager);
                                                }
                                                return managerArr;
                                            },
                                            message: "choose your manager?"
                                            
                                        }
                                    ])
                                    .then((answer) => {
                                        // console.log(answer);
                                        let fullName = answer.managerList;
                                        const fullNameArr= fullName.split(" ");
                                        // console.log(fullNameArr);
                                        const managerFirstName = fullNameArr[0];
                                        const managerLastName = fullNameArr[1];
                                        connection.query('SELECT id FROM employee where first_name = ? AND last_name = ?', [managerFirstName, managerLastName], (err, result) => {
                                            const managerId= result[0].id;
                                            // console.log('managerId',managerId);
                                            connection.query('INSERT INTO employee SET first_name=?, last_name=?, role_id=?, manager_id=?', [firstName,lastName,roleid,managerId], (err, res)=> {
                                                if(err) throw err;
                                                startManage();
                                            })
                                        })

                                    })
                            })

                        })
                    })
            })
        })
    
}

function updateEmployeeRole() {
    connection.query('SELECT CONCAT_WS(" ", first_name, last_name) AS emp FROM employee WHERE manager_id IS NOT NULL', (err, results) => {
        inquirer
            .prompt([
                {
                    name: "employeeList",
                    type: "list",
                    choices: function() {
                        const employeeArr = [];
                        for(let i=0; i< results.length; i++){
                            employeeArr.push(results[i].emp);
                        }
                        return employeeArr;
                    },
                    message: "choose the employee you want to update the role?"
                }
            ])
            .then((answer) => {
                // console.log(answer);
                const chosenEmployee = answer.employeeList;
                const chosenEmployeeArr = chosenEmployee.split(" ");
                const employeeFirstName = chosenEmployeeArr[0];
                const employeeLastName = chosenEmployeeArr[1];
                // console.log(employeeFirstName);
                // console.log(employeeLastName);
                connection.query("SELECT title FROM role", (err, results)=> {
                    inquirer
                        .prompt([
                            {
                                name: "roleList",
                                type: "list",
                                choices: function() {
                                    const roleArr = [];
                                    for(let i=0; i< results.length; i++) {
                                        roleArr.push(results[i].title);
                                    }
                                    return roleArr;
                                },
                                message: "choose the role to update the existing role?"
                                
                            }
                        ])
                        .then((answer)=> {
                            // console.log(answer);
                            connection.query(`SELECT id FROM role WHERE title= "${answer.roleList}"`, (err, result)=> {
                                // console.log(result);
                                const roleId= result[0].id;
                                 connection.query('UPDATE employee SET role_id= ? WHERE first_name =? AND last_name=?',
                                 [roleId,employeeFirstName,employeeLastName], (err, result)=> {
                                     if(err) throw err;
                                     startManage();
                                 })
                            })
                        })
                })
            })
    })
    
}
function join() {
    const sql = "SELECT a.id, a.first_name, a.last_name, role.title AS title, department.name AS department, role.salary AS salary, CONCAT_WS(' ', b.first_name, b.last_name) AS manager FROM department INNER JOIN role ON department.id = role.department_id INNER JOIN employee AS a ON role.id = a.role_id LEFT JOIN employee AS b ON a.manager_id = b.id";
    connection.query(sql, function (err, results) {
        if (err) throw err;
        // console.log(results);
        const consoleArr = [];
        for (let i = 0; i < results.length; i++) {
            let obj = {
                id: results[i].id,
                first_name: results[i].first_name,
                last_name: results[i].last_name,
                title: results[i].title,
                department: results[i].department,
                salary: results[i].salary,
                manager: results[i].manager
            };
            consoleArr.push(obj);
        }
        console.table(consoleArr);
        startManage();
    })
}