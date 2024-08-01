(Trigger for when a user registers with a username
that is already taken)

DELIMITER //

SELECT COUNT(*) INTO user_count FROM User_Account WHERE UserName = NEW.UserName;

    IF user_count > 0 THEN
        SET msg = 'Error: UserName already exists.';
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = msg;
    END IF;

DELIMITER ;


(Trigger for after insertion into the Expenses table)

DELIMITER //

CREATE TRIGGER after_expense_insert
AFTER INSERT ON Expenses
FOR EACH ROW
BEGIN
    DECLARE total_expenses DECIMAL(10, 2);

    SELECT SUM(Amount) INTO total_expenses
    FROM Expenses
    WHERE ProfileID = NEW.ProfileID;

    UPDATE Budget
    SET Money = Money - total_expenses
    WHERE ProfileID = NEW.ProfileID;
END//

(Trigger for after deletion from the Expenses table)

DELIMITER //

CREATE TRIGGER after_expense_delete
AFTER DELETE ON Expenses
FOR EACH ROW
BEGIN

    UPDATE Budget
    SET Money = Money + OLD.Amount
    WHERE ProfileID = OLD.ProfileID;
END//

DELIMITER ;

END//


(Trigger for after updating expenses from the Expenses table. 
EVENT: AFTER UPDATE ON Expenses, CONDITION: IF difference <> 0,
ACTION: UPDATE Budget)

DELIMITER //

CREATE TRIGGER after_expense_update
AFTER UPDATE ON Expenses
FOR EACH ROW
BEGIN
    DECLARE difference DECIMAL(10, 2);


    SET difference = NEW.Amount - OLD.Amount;

    IF difference <> 0 THEN
        UPDATE Budget
        SET Money = Money - difference
        WHERE ProfileID = NEW.ProfileID;
    END IF;
END//

DELIMITER ;




