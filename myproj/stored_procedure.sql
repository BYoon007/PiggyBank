CREATE PROCEDURE GetExpensesStats2()
BEGIN
    DECLARE totalWantExpenses DECIMAL(10, 2);

    SELECT SUM(ex.Amount)
    INTO totalWantExpenses
    FROM Expenses ex
    WHERE ex.ExpenseType = 'Want';

    IF totalWantExpenses > 1000.00 THEN
        SELECT ex.Amount, ex.CategoryName, ex.ExpenseID
        FROM Expenses ex 
        JOIN Budget b ON ex.BudgetId = b.BudgetId
        WHERE b.Money > 100.00 AND ex.ExpenseType = 'Want' 
        AND ex.Amount = (
            SELECT MAX(ex2.Amount) 
            FROM Expenses ex2
            WHERE ex2.CategoryName = ex.CategoryName 
            AND ex2.BudgetId = ex.BudgetId 
            GROUP BY ex2.CategoryName
            ORDER BY MAX(ex2.Amount) DESC
            LIMIT 10
        )
        ORDER BY ex.Amount DESC;

        SELECT UserName, FirstName, Email, CategoryName, AVG(Amount) as avg_Amount
        FROM User_Account ua
        NATURAL JOIN Expenses e 
        WHERE e.UserName IN (
            SELECT e1.UserName
            FROM Expenses e1
            GROUP BY e1.UserName
            HAVING COUNT(DISTINCT e1.CategoryName) > 1
        )
        GROUP BY UserName, e.CategoryName 
        ORDER BY avg_Amount DESC;
    ELSE
        SELECT 'Total want expenses are below the threshold.' AS Message;
    END IF;
END //

DELIMITER ;
