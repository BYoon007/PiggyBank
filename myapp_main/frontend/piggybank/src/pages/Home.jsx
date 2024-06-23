import React from "react";
import Button from "@mui/material/Button";

function Home() {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh"}}>
            <div style={{ textAlign: "center" }}>
                <h1>Start budgeting with piggyBank</h1>
                <p>This is the main page of your app.</p>
                <Button variant="contained" sx={{ backgroundColor: "black"}}>Sign up</Button>
            </div>
        </div>
    );
}

export default Home;
