var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
var app = express();
var cors = require('cors');

const session = require('express-session');






var connection = mysql.createConnection({
                host: '35.193.72.67',
                user: 'root',
                password: '7}eb4)MX"|2a*:ok',
                database: 'cs411project'
});

connection.connect;


// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));
app.use(express.static(path.join(__dirname, 'public')));


app.listen(80, function () {
    console.log('Node app is running on port 80');
});


app.get('/', function(req, res) {
        res.render('homepage');
});

app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/profile');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

/* Routes */

app.get('/homepage', (req, res) => {

    res.render('homepage');
    
    });

app.get('/registration', (req, res) => {

    res.render('registration');
    
    });

app.get('/login', (req, res) => {

    res.render('login');
    
    });

app.get('/expenses'  , (req, res) => {
        const userName  = req.session.username;

        if(!userName) {
                return res.redirect('/login'); 
        }
        
	const sql = 'SELECT * FROM Expenses WHERE UserName = ?';
	connection.query(sql, [userName], (err, results) => {
		if(err) {
			console.error('Error retrieving expenses:', err.stack);
			return res.status(500).send('Error retrieveing expenses. Please try again!');
		}
		
		res.render('expenses', { expenses: results });
	});
    });

app.get('/budget', (req, res) => {

    res.render('budget');
    
    });

app.get('/profile', (req, res) => {

   res.render('profile');
    
   });

app.get('/monthlyplanner', (req, res) => {

   res.render('monthlyplanner');
    
   });

app.get('/transaction', (req, res) => {

   res.render('transaction');
    
   });

app.get('/procedure', (req, res) => {

   res.render('procedure');
    
   });

// Search route
app.get('/search', function(req, res) {
        var query = req.query.query;
	console.log('Received query:', query); // Log the received query
	if (!query) {
	    return res.json([]);
	}
        var sql = `SELECT ExpenseID, CategoryName, ExpenseType, Amount, ProfileID, BudgetID, UserName FROM Expenses WHERE CategoryName LIKE ? OR ExpenseType LIKE ? OR UserName LIKE ?`;
        var values = [`%${query}%`, `%${query}%`, `%${query}%`];
	
	console.log('SQL Query:', sql); //Log the query
	console.log('Query Values:', values); //Log the values being used

        connection.query(sql, values, (error, results) => {
                if (error) {
		   console.error('Error executing query:', error);
		   res.status(500).json({ error: 'Database error' });
		   return;
		}
		//console.log('Query results:', results); // Log the query results
                res.json(results);
        });
});

//Registration
app.post('/registerNewAccount', function(req, res) {
  var UserName = req.body.UserName;
  var FirstName = req.body.FirstName;
  var Email = req.body.Email;
  var Password = req.body.Password;
  
  console.log('Checkpoint 1');
  
  var sql = `INSERT INTO User_Account (UserName, FirstName, Email, Password) VALUES ('${UserName}', '${FirstName}', '${Email}', '${Password}')`
  
  // Checks if connection works
  connection.query(sql, [UserName, FirstName, Email, Password], function (err, result) {
      if (err) {
         console.error('Error executing query:', err.message);
         res.status(500).send('Error registering new account. ' + err.message);
         return;
     }

      console.log('Checkpoint 2: Registered sucessfully!');
      res.redirect('/login');
      });
  });

app.post('/loginAction', function(req, res) {
  var UserName = req.body.UserName;
  var Password = req.body.Password;


  console.log('Checkpoint 1');

  const sql = `CALL UserLogin ('${UserName}', '${Password}', @login_success);`;
  connection.query(sql, [UserName, Password], function (err, results) {
        if (err) {
            console.error('Error executing query:', err.stack);
            res.status(500).send('Error logging in. Please try again!');
            return;
        }
	const selectSuccess = 'SELECT @login_success AS login_success';
        connection.query(selectSuccess, (err, results) => {
            if (err) {
                console.error('Error selecting login success:', err.stack);
                res.status(500).send('Error logging in. Please try again!');
                return;
            }

            console.log('Results:', results);

            const loginSuccess = results[0].login_success;
	    console.log(results[0].login_success);
	
        if (loginSuccess) {
            console.log('Checkpoint 2: Login successful!');

	
            req.session.username = UserName;
            res.redirect('/profile');
        } else {
            console.log('Checkpoint 2: Login failed. Invalid username or password.');
            res.status(500).send('Invalid username or password.');
              }
        });
    });
});

// Save Profiles on Profile Page
app.post('/SaveProfileAction', function(req, res) {
    var UserName = req.body.UserName;
    var Major = req.body.Major || 'undecided';
    var School_Year = req.body.School_Year || 1;
    var Gender = req.body.Gender || 'unknown';
    var Age = req.body.Age || 0;

    // Checkboxes: Set default to 0 if not checked
    var Job = req.body.Job ? 1 : 0;
    var Drinking = req.body.Drinking ? 1 : 0;
    var Smoking = req.body.Smoking ? 1 : 0;
    var Scholarship = req.body.Scholarship ? 1 : 0;
    var Housing = req.body.Housing ? 1 : 0;
  console.log('Profile Checkpoint 1');

  // Check if the UserName exists in the User_Account table
    const checkUserSql = `SELECT UserName FROM User_Account WHERE UserName = '${UserName}'`;
    connection.query(checkUserSql, (err, userResults) => {
        if (err) {
            console.error('Error checking user existence:', err.stack);
            res.status(500).send('Error checking user existence!');
            return;
        }

        if (userResults.length === 0) {
            // Username does not exist in user_Account table
            res.status(400).send('Username does not exist!');
            return;
        } else {
            // Username exists in user_Account table
            const checkProfileSql = `SELECT * FROM ProfileCreation WHERE UserName = '${UserName}'`;
            connection.query(checkProfileSql, (err, profileResults) => {
                if (err) {
                    console.error('Error checking profile existence:', err.stack);
                    res.status(500).send('Error checking profile existence!');
                    return;
                }
                 if (profileResults.length === 0) {
                    // Username does not exist in ProfileCreation table, insert new record
                    const selectProfileIdSql = `SELECT (MAX(ProfileID)) + 1 AS nextProfileID FROM ProfileCreation`;

                    connection.query(selectProfileIdSql, (selectError, selectResults) => {
                    if (selectError) throw selectError;

                    const nextProfileID = selectResults[0].nextProfileID;
                    console.log(`Next ProfileID for ${UserName}: ${nextProfileID}`);

                    const insertProfileSql = `INSERT INTO ProfileCreation (ProfileID, Gender, Age, Job, Drinking, Housing, Major, Scholarship, Smoking, School_Year, UserName) VALUES (${nextProfileID}, '${Gender}', '${Age}', '${Job}', '${Drinking}', '${Housing}', '${Major}', '${Scholarship}', '${Smoking}', '${School_Year}', '${UserName}')`;

                    connection.query(insertProfileSql, (insertError, insertResults) => {
                    if (insertError) throw insertError;
                    console.log('Profile inserted successfully');
                    res.status(500).send('Profile saved successfully!');
                 });
             });
           // If UserName already exists in the ProfileCreation
           } else {
                    const selectProfileIdSql = `SELECT (MAX(ProfileID)) + 1 AS nextProfileID FROM ProfileCreation`;

                    connection.query(selectProfileIdSql, (selectError, selectResults) => {
                    if (selectError) throw selectError;

                    const nextProfileID = selectResults[0].nextProfileID;
                    console.log(`Next ProfileID for ${UserName}: ${nextProfileID}`);

                    const insertProfileSql = `INSERT INTO ProfileCreation (ProfileID, Gender, Age, Job, Drinking, Housing, Major, Scholarship, Smoking, School_Year, UserName) VALUES (${nextProfileID}, '${Gender}', '${Age}', '${Job}', '${Drinking}', '${Housing}', '${Major}', '${Scholarship}', '${Smoking}', '${School_Year}', '${UserName}')`;

                    connection.query(insertProfileSql, (insertError, insertResults) => {
                    if (insertError) throw insertError;
                    console.log('Profile saved successfully');
                    res.status(500).send('Profile saved successfully!');
                    });
                });
              }
           });
        }
   });
});



// Get User Name
app.get('/profile', (req, res) => {
    // Use a parameterized query to avoid SQL injection
    const sql = `SELECT MAX(ProfileID) AS profileID FROM ProfileCreation WHERE UserName = ${req.session.username}`;

    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            res.status(401).send('Error retrieving profile ID. Please try again!');
            return;
        }

        // Extract profileID from results
	const profileIDFromSQL = results[0]?.profileID || 'Not Available';
        // Render the profile page and pass the profileID
        res.render('/profile', { ProfileID: profileIDFromSQL });
    });
});


// Save Budget
app.post('/saveBudget', (req, res) => {
    const userName = req.body.UserName;
    const budget = req.body.budget || req.body['preselected-budgets'];

    if (!userName || !budget) {
        return res.status(401).send('Username and budget are required.');
    }

    // Find the maximum ProfileID associated with the username
    const findMaxProfileIdSql = 'SELECT MAX(ProfileID) AS MaxProfileID FROM ProfileCreation WHERE UserName = ?';
    connection.query(findMaxProfileIdSql, [userName], (err, results) => {
        if (err) {
            console.error('Error executing query:', err.stack);
            return res.status(401).send('Error retrieving profile ID.');
        }

        if (results.length === 0 || !results[0].MaxProfileID) {
            return res.status(401).send('Profile not found for the given username.');
        }

        const maxProfileId = results[0].MaxProfileID;

        // Check if the user already has a budget
        const checkBudgetSql = 'SELECT BudgetID FROM Budget WHERE ProfileID = ?';
        connection.query(checkBudgetSql, [maxProfileId], (err, budgetResults) => {
            if (err) {
                console.error('Error checking budget:', err.stack);
                return res.status(401).send('Error checking budget.');
            }

            if (budgetResults.length > 0) {
                // User already has a budget, update the existing budget
                const budgetId = budgetResults[0].BudgetID;
                const updateBudgetSql = 'UPDATE Budget SET Money = ? WHERE BudgetID = ?';
                connection.query(updateBudgetSql, [budget, budgetId], (err) => {
                    if (err) {
                        console.error('Error updating budget:', err.stack);
                        return res.status(401).send('Error updating budget.');
                    }
                    console.log('Budget updated successfully for username:', userName);
                    res.status(200).send('Budget updated successfully!');
                });
            } else {
                // User does not have a budget, insert a new budget entry
                const findMaxBudgetIdSql = 'SELECT MAX(BudgetID) AS MaxBudgetID FROM Budget';
                connection.query(findMaxBudgetIdSql, (err, budgetIdResults) => {
                    if (err) {
                        console.error('Error finding max BudgetID:', err.stack);
                        return res.status(401).send('Error finding max BudgetID.');
                    }

                    const maxBudgetId = budgetIdResults[0].MaxBudgetID ? budgetIdResults[0].MaxBudgetID + 1 : 1;

                    const insertBudgetSql = 'INSERT INTO Budget (ProfileID, BudgetID, Money) VALUES (?, ?, ?)';
                    connection.query(insertBudgetSql, [maxProfileId, maxBudgetId, budget], (err) => {
                        if (err) {
                            console.error('Error inserting budget:', err.stack);
                            return res.status(401).send('Error saving budget.');
                        }
                        console.log('Budget saved successfully for username:', userName);
                        res.status(200).send('Budget saved successfully!');
                    });
                });
            }
        });
    });
});

// Add Expenses
app.post('/addExpense', (req, res) => {
    console.log('Request body:', req.body);
    const { categoryName, expenseType, amount, username } = req.body;

    // First, get the maximum ProfileID
    const queryGetMaxProfileID = 'SELECT MAX(ProfileID) AS maxProfileID FROM ProfileCreation WHERE UserName = ?';
    connection.query(queryGetMaxProfileID, [username], (err, maxProfileResults) => {
        if (err) {
            console.error('Error fetching max ProfileID:', err);
            return res.status(500).send('Internal Server Error');
        }

        if (maxProfileResults.length === 0 || maxProfileResults[0].maxProfileID === null) {
            return res.status(404).send('No profiles found for the given username');
        }

        const maxProfileID = maxProfileResults[0].maxProfileID;
        console.log('This is maxProfileID:', maxProfileID);

        // Then, get BudgetID using the retrieved ProfileID
        const queryGetBudgetID = 'SELECT BudgetID FROM Budget WHERE ProfileID = ?';
        connection.query(queryGetBudgetID, [maxProfileID], (err, budgetResults) => {
            console.log('Budgetresults:', budgetResults);
            if (err) {
                console.error('Error fetching BudgetID:', err);
                return res.status(500).send('Internal Server Error');
            }
            console.log('In between checkpoint');
           
            if (budgetResults.length === 0 || !budgetResults) {
                console.error('Error: BudgetID does not exist for this ProfileID');
                return res.status(200).send('Budget not found for the given ProfileID');
            }

            const budgetID = budgetResults[0].BudgetID;
            console.log('This is the budgetID:', budgetID);
            // Now, call the stored procedure to add the expense
            const sql = 'CALL AddExpense(?, ?, ?, ?, ?, ?)';
            const values = [categoryName, expenseType, amount, maxProfileID, budgetID, username];

            connection.query(sql, values, (error, results) => {
                if (error) {
                    console.error('Error executing query:', error);
                    return res.status(500).send('Internal Server Error');
                }
                console.log('Expense added successfully!');
                res.status(200).send('Expense added successfully!');
            });
        });
    });
});


//Get Expenses
app.get('/getExpenses', (req, res) => {
	const userName = req.session.username;
	const sql = 'SELECT * FROM Expenses WHERE UserName = ?';

	if (!userName) {
		return res.redirect('/login');
	}

    	connection.query(sql, [userName], (error, results) => {
        	if (error) {
            		console.error('Error fetching expenses:', error);
            		res.status(404).send('Internal Server Error');
            		return;
        	}
        	res.json(results); // Send expenses as JSON
    	});
});

//Get Specific Expenses
app.get('/getExpense/:expenseID', function(req, res) {
    const expenseID = req.params.expenseID;
    const sql = 'SELECT * FROM Expenses WHERE ExpenseID = ?';

    connection.query(sql, [expenseID], (err, results) => {
        if (err) {
            console.error('Error fetching expense details:', err.stack);
            return res.status(404).send('Error fetching expense details.');
        }

        if (results.length > 0) {
            res.send(results[0]);
        } else {
            res.status(200).send('Expense not found.');
        }
    });
});

//Delete Expenses
app.delete('/deleteExpense/:id', (req, res) => {
	const expenseID = req.params.id;
	const userName = req.session.username;
	const sql = 'DELETE FROM Expenses WHERE ExpenseID = ? AND UserName = ?';
	
	console.log('Received expenseID:', expenseID);
	console.log('UserName:', userName);

	connection.query(sql, [expenseID, userName], (err, results) => {
		if(err) {
			console.error('Error deleting expense:', err.stack);
			return res.status(404).send('Error deleting expense. Please try again!');
		}
		res.send({ success: true });
	});
});

// Update Expense
app.put('/updateExpense', function(req, res) {
    const { expenseID, categoryName, expenseType, amount, username } = req.body;
    console.log('Received PUT request with data:', req.body); // Log request body

    // Check if all required fields are provided
    if (!expenseID || !categoryName || !expenseType || !amount || !username) {
        return res.status(404).send({ success: false, message: 'Missing required fields.' });
    }

    const sql = 'UPDATE Expenses SET CategoryName = ?, ExpenseType = ?, Amount = ?, UserName = ? WHERE ExpenseID = ? AND UserName = ?';

    connection.query(sql, [categoryName, expenseType, amount, username, expenseID, req.session.username], (err, results) => {
        if (err) {
            console.error('Error updating expense:', err.stack);
            return res.status(404).send({ success: false });
        }
        res.send({ success: true });
    });
});


// Route to perform transaction
app.post('/perform-transaction', async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      // Set the isolation level to REPEATABLE READ before starting the transaction
      connection.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ', (err) => {
        if (err) {
          console.error('Error setting isolation level:', err);
          return reject(err);
        }

        connection.beginTransaction((err) => {
          if (err) {
            console.error('Error starting transaction:', err);
            return reject(err);
          }

          console.log('Before advancedquery1');
          const advancedquery1 = `SELECT 
            ua.UserName, 
            ua.FirstName, 
            ua.Email, 
            SUM(CASE WHEN e.ExpenseType = 'Need' THEN e.Amount ELSE 0 END) AS TotalNeedsExpenses,
            SUM(CASE WHEN e.ExpenseType = 'Want' THEN e.Amount ELSE 0 END) AS TotalWantsExpenses,
            b.Money AS TotalBudget,
            mp.Needs AS NeedsPercentage,
            mp.Wants AS WantsPercentage,
            mp.Savings AS SavingsPercentage,
            (SUM(CASE WHEN e.ExpenseType = 'Need' THEN e.Amount ELSE 0 END) / b.Money) * 100 AS ActualNeedsPercentage,
            (SUM(CASE WHEN e.ExpenseType = 'Want' THEN e.Amount ELSE 0 END) / b.Money) * 100 AS ActualWantsPercentage,
            ((b.Money - SUM(CASE WHEN e.ExpenseType IN ('Need', 'Want') THEN e.Amount ELSE 0 END)) / b.Money) * 100 AS ActualSavingsPercentage
          FROM 
            User_Account ua 
          JOIN 
            Expenses e ON ua.UserName = e.UserName 
          JOIN 
            Budget b ON e.BudgetID = b.BudgetID 
          JOIN 
            Monthly_Plans mp ON b.BudgetID = mp.BudgetID
          GROUP BY 
            ua.UserName, 
            ua.FirstName, 
            ua.Email, 
            b.Money, 
            mp.Needs, 
            mp.Wants, 
            mp.Savings
          HAVING 
            (SUM(CASE WHEN e.ExpenseType = 'Need' THEN e.Amount ELSE 0 END) / b.Money) * 100 <= mp.Needs
            AND (SUM(CASE WHEN e.ExpenseType = 'Want' THEN e.Amount ELSE 0 END) / b.Money) * 100 <= mp.Wants
            AND ((b.Money - SUM(CASE WHEN e.ExpenseType IN ('Need', 'Want') THEN e.Amount ELSE 0 END)) / b.Money) * 100 >= mp.Savings LIMIT 15`;

          connection.query(advancedquery1, (err, results1) => {
            console.log('Advancedquery 1');
            if (err) {
              console.error('Error executing advancedquery1:', err);
              return connection.rollback(() => {
                res.status(500).json({ message: 'Transaction failed during advancedquery1.', error: err.message });
                return reject(err);
              });
            }

            // IF statement to check if results1 contains any rows
            if (results1.length > 0) {
              const advancedquery2 = `SELECT pc.Major COLLATE utf8mb4_general_ci AS 'Major/SchoolYear', MIN(e.Amount) AS Minimum_Expense, AVG(e.Amount) AS Average_Expense, MAX(e.Amount) AS Maximum_Expense
                FROM ProfileCreation pc NATURAL JOIN Expenses e JOIN Budget b ON (e.BudgetID = b.BudgetID)
                GROUP BY pc.Major
                HAVING MAX(e.Amount) > 500
                UNION
                SELECT CAST(pc.School_Year AS CHAR) COLLATE utf8mb4_general_ci AS 'Major/SchoolYear', MIN(e.Amount) AS Minimum_Expense, AVG(e.Amount) AS Average_Expense, MAX(e.Amount) AS Maximum_Expense
                FROM ProfileCreation pc NATURAL JOIN Expenses e JOIN Budget b ON (e.BudgetID = b.BudgetID)
                GROUP BY pc.School_Year
                HAVING MAX(e.Amount) > 500
                LIMIT 15`;

              connection.query(advancedquery2, (err, results2) => {
                console.log('Advancedquery 2');
                if (err) {
                  console.error('Error executing advancedquery2:', err);
                  return connection.rollback(() => {
                    res.status(500).json({ message: 'Transaction failed during advancedquery2.', error: err.message });
                    return reject(err);
                  });
                }

                console.log('Passed both advanced queries');
                connection.commit((err) => {
                  if (err) {
                    console.error('Error committing transaction:', err);
                    return connection.rollback(() => {
                      res.status(500).json({ message: 'Transaction failed during commit.', error: err.message });
                      return reject(err);
                    });
                  }
                  console.log('After commit');
                  res.status(200).json({ results1, results2 });
                  return resolve();
                });
              });
            } else {
              connection.rollback(() => {
                res.status(200).json({ message: 'No data found in the first query, transaction rolled back.' });
                return resolve();
              });
            }
          });
        });
      });
    });
  } catch (error) {
    console.error('Transaction failed:', error);
    res.status(500).json({ message: 'Transaction failed.', error: error.message });
  }
});

// Route to perform stored procedure
app.post('/perform-procedure', (req, res) => {
  const storedprocedurequery = 'CALL GetExpensesStats2()';

  connection.query(storedprocedurequery, (err, results) => {
    if (err) {
      console.error('Error executing stored procedure:', err);
      return res.status(500).json({ message: 'Execution failed.', error: err.message });
    }

    // MySQL stored procedures typically return an array of arrays
    if (Array.isArray(results) && results.length > 0) {
      // Check the structure of the first result set
      if (results[0] && Array.isArray(results[0])) {
        const results1 = results[0]; // First result set
        const results2 = results.length > 1 && Array.isArray(results[1]) ? results[1] : []; // Second result set

        // Send the results to the client
        res.status(200).json({ results1, results2 });
      } else {
        console.error('Unexpected result structure:', results);
        res.status(500).json({ message: 'Unexpected result structure from stored procedure.' });
      }
    } else {
      console.error('No results returned from stored procedure.');
      res.status(500).json({ message: 'No results returned from stored procedure.' });
    }
  });
});

// Monthly Planner Page
app.get('/monthlyplanner', (req, res) => {
    const userName = req.body.username;
    if (!userName) {
        return res.redirect('/login');
    }

    const findMaxProfileIdSql = 'SELECT MAX(ProfileID) AS MaxProfileID FROM ProfileCreation WHERE UserName = ?';
    connection.query(findMaxProfileIdSql, [userName], (err, results) => {
        if (err) {
            console.error('Error retrieving profile ID:', err.stack);
            return res.status(404).send('Error retrieving profile ID.');
        }
        if (results.length === 0 || !results[0].MaxProfileID) {
            return res.status(404).send('Profile not found for the given username.');
        }
        const maxProfileId = results[0].MaxProfileID;

        const findBudgetSql = 'SELECT BudgetID FROM Budget WHERE ProfileID = ?';
        connection.query(findBudgetSql, [maxProfileId], (err, budgetResults) => {
            if (err) {
                console.error('Error retrieving budget ID:', err.stack);
                return res.status(404).send('Error retrieving budget ID.');
            }
            if (budgetResults.length === 0 || !budgetResults[0].BudgetID) {
                return res.status(404).send('Budget not found for the given ProfileID.');
            }
            const budgetId = budgetResults[0].BudgetID;

            const findMonthlyPlanSql = 'SELECT * FROM Monthly_Plans WHERE BudgetID = ?';
            connection.query(findMonthlyPlanSql, [budgetId], (err, planResults) => {
                if (err) {
                    console.error('Error retrieving monthly plan:', err.stack);
                    return res.status(404).send('Error retrieving monthly plan.');
                }
                res.render('monthlyplanner', { plan: planResults.length > 0 ? planResults[0] : null });
            });
        });
    });
});



// Save Monthly Plan
app.post('/savemonthlyplan', (req, res) => {
    const userName = req.body.username;
    const { needs, wants, savings } = req.body;

    if (!userName || !needs || !wants || !savings) {
        console.error('Missing required fields:', { userName, needs, wants, savings });
        return res.status(404).send('Username, Needs, Wants, and Savings are required.');
    }

    // Validate percentages
    const total = parseInt(needs) + parseInt(wants) + parseInt(savings);
    if (total !== 100) {
        console.error('Invalid total percentage:', { needs, wants, savings, total });
        return res.status(404).send('The total percentage for Needs, Wants, and Savings must equal 100%.');
    }

    const findMaxProfileIdSql = 'SELECT MAX(ProfileID) AS MaxProfileID FROM ProfileCreation WHERE UserName = ?';
    connection.query(findMaxProfileIdSql, [userName], (err, results) => {
        if (err) {
            console.error('Error retrieving profile ID:', err.stack);
            return res.status(404).send('Error retrieving profile ID.');
        }
        if (results.length === 0 || !results[0].MaxProfileID) {
            console.error('Profile not found for username:', userName);
            return res.status(404).send('Profile not found for the given username.');
        }
        const maxProfileId = results[0].MaxProfileID;
        console.log('Retrieved ProfileID:', maxProfileId);

        const findBudgetSql = 'SELECT BudgetID FROM Budget WHERE ProfileID = ?';
        connection.query(findBudgetSql, [maxProfileId], (err, budgetResults) => {
            if (err) {
                console.error('Error retrieving budget ID:', err.stack);
                return res.status(404).send('Error retrieving budget ID.');
            }
            if (budgetResults.length === 0 || !budgetResults[0].BudgetID) {
                console.error('Budget not found for ProfileID:', maxProfileId);
                return res.status(404).send('Budget not found for the given ProfileID. Please create a budget first.');
            }
            const budgetId = budgetResults[0].BudgetID;
            console.log('Retrieved BudgetID:', budgetId);

            const checkPlanSql = 'SELECT PlanID FROM Monthly_Plans WHERE BudgetID = ?';
            connection.query(checkPlanSql, [budgetId], (err, planResults) => {
                if (err) {
                    console.error('Error checking monthly plan:', err.stack);
                    return res.status(404).send('Error checking monthly plan.');
                }
                if (planResults.length > 0) {
                    const planId = planResults[0].PlanID;
                    const updatePlanSql = 'UPDATE Monthly_Plans SET Needs = ?, Wants = ?, Savings = ? WHERE PlanID = ?';
                    console.log(`Updating plan with PlanID: ${planId} and BudgetID: ${budgetId}`);
                    connection.query(updatePlanSql, [needs, wants, savings, planId], (err, result) => {
                        if (err) {
                            console.error('Error updating monthly plan:', err.stack);
                            return res.status(404).send('Error updating monthly plan.');
                        }
                        console.log('Monthly plan updated successfully:', {
                            userName,
                            planId,
                            needs,
                            wants,
                            savings,
                            affectedRows: result.affectedRows
                        });
                        res.status(200).send('Monthly plan updated successfully!');
                    });
                } else {
                    const findMaxPlanIdSql = 'SELECT MAX(PlanID) AS MaxPlanID FROM Monthly_Plans';
                    connection.query(findMaxPlanIdSql, (err, planIdResults) => {
                        if (err) {
                            console.error('Error finding max PlanID:', err.stack);
                            return res.status(404).send('Error finding max PlanID.');
                        }
                        const maxPlanId = planIdResults[0].MaxPlanID ? planIdResults[0].MaxPlanID + 1 : 1;
                        const insertPlanSql = 'INSERT INTO Monthly_Plans (PlanID, Needs, Wants, Savings, BudgetID) VALUES (?, ?, ?, ?, ?)';
                        console.log(`Inserting new plan with PlanID: ${maxPlanId} and BudgetID: ${budgetId}`);
                        connection.query(insertPlanSql, [maxPlanId, needs, wants, savings, budgetId], (err, result) => {
                            if (err) {
                                console.error('Error inserting monthly plan:', err.stack);
                                return res.status(404).send('Error saving monthly plan.');
                            }
                            console.log('Monthly plan saved successfully:', {
                                userName,
                                maxPlanId,
                                needs,
                                wants,
                                savings,
                                affectedRows: result.affectedRows
                            });
                            res.status(200).send('Monthly plan saved successfully!');
                        });
                    });
                }
            });
        });
    });
});
   
// Delete Monthly Plan
app.post('/deletemonthlyplan', (req, res) => {
    const userName = req.body.username;

    if (!userName) {
        return res.status(401).send('Username is required.');
    }

    const findMaxProfileIdSql = 'SELECT MAX(ProfileID) AS MaxProfileID FROM ProfileCreation WHERE UserName = ?';
    connection.query(findMaxProfileIdSql, [userName], (err, results) => {
        if (err) {
            console.error('Error retrieving profile ID:', err.stack);
            return res.status(404).send('Error retrieving profile ID.');
        }
        if (results.length === 0 || !results[0].MaxProfileID) {
            return res.status(404).send('Profile not found for the given username.');
        }
        const maxProfileId = results[0].MaxProfileID;

        const findBudgetSql = 'SELECT BudgetID FROM Budget WHERE ProfileID = ?';
        connection.query(findBudgetSql, [maxProfileId], (err, budgetResults) => {
            if (err) {
                console.error('Error retrieving budget ID:', err.stack);
                return res.status(401).send('Error retrieving budget ID.');
            }
            if (budgetResults.length === 0 || !budgetResults[0].BudgetID) {
                return res.status(401).send('Budget not found for the given ProfileID.');
            }
            const budgetId = budgetResults[0].BudgetID;

            const deletePlanSql = 'DELETE FROM Monthly_Plans WHERE BudgetID = ?';
            connection.query(deletePlanSql, [budgetId], (err) => {
                if (err) {
                    console.error('Error deleting monthly plan:', err.stack);
                    return res.status(401).send('Error deleting monthly plan.');
                }
                console.log('Monthly plan deleted successfully for username:', userName);
                res.status(200).send('Monthly plan deleted successfully!');
            });
        });
    });
});


app.get('/spendingHabits', (req, res) => {
	const userName = req.session.username;
	const topExpensesSql = 'SELECT ex.ExpenseID, ex.CategoryName, ex.Amount, ex.ExpenseType FROM Expenses ex JOIN Budget b ON ex.BudgetID = b.BudgetID WHERE ex.UserName = ? ORDER BY ex.Amount DESC LIMIT 10';
	const similarSpendersSql = 'SELECT  ex.CategoryName, u.FirstName, u.UserName FROM Expenses ex JOIN Budget b ON ex.BudgetID = b.BudgetID JOIN User_Account u ON u.UserName = ex.UserName WHERE u.UserName != ? ORDER BY ex.Amount DESC';
	connection.query(topExpensesSql, [userName], (err, topExpensesResults) => {
		if (err) {
			console.error('Error retrieving  top expenses.', err);
			return res.status(404).send('Error  retrieving top expenses');
		}

		connection.query(similarSpendersSql, [userName], (err, similarSpendersResults) => {
			if(err) {
				console.error('Error retrieving similar spenders:', err);
				return res.status(500).send('Error retrieving similar spenders');
			}
		console.log('Similar Spenders Results:', similarSpendersResults);

		//group similar spenders by category
		const groupedSpenders = similarSpendersResults.reduce((acc, spender) => {
			if(!acc[spender.CategoryName]) {
				acc[spender.CategoryName] = [];
			}
			acc[spender.CategoryName].push({name: spender.FirstName, username: spender.UserName});
			return acc;
		}, {});
		res.json({
			topExpenses: topExpensesResults,
			similarSpenders: Object.keys(groupedSpenders).map(category => ({
				CategoryName: category,
				users: groupedSpenders[category]
			}))
		});
	});
    });
});
