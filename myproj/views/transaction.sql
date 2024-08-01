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



START TRANSACTION;

SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT 
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
    AND ((b.Money - SUM(CASE WHEN e.ExpenseType IN ('Need', 'Want') THEN e.Amount ELSE 0 END)) / b.Money) * 100 >= mp.Savings
LIMIT 15;

SELECT pc.Major COLLATE utf8mb4_general_ci AS 'Major/SchoolYear', MIN(e.Amount) AS Minimum_Expense, AVG(e.Amount) AS Average_Expense, MAX(e.Amount) AS Maximum_Expense
FROM ProfileCreation pc NATURAL JOIN Expenses e JOIN Budget b ON (e.BudgetID = b.BudgetID)
GROUP BY pc.Major
HAVING MAX(e.Amount) > 500
UNION
SELECT CAST(pc.School_Year AS CHAR) COLLATE utf8mb4_general_ci AS 'Major/SchoolYear', MIN(e.Amount) AS Minimum_Expense, AVG(e.Amount) AS Average_Expense, MAX(e.Amount) AS Maximum_Expense
FROM ProfileCreation pc NATURAL JOIN Expenses e JOIN Budget b ON (e.BudgetID = b.BudgetID)
GROUP BY pc.School_Year
HAVING MAX(e.Amount) > 500
LIMIT 15;