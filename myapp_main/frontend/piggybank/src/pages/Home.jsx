import React from "react";
import Button from "@mui/material/Button";
import Footer from "../components/Footer";
import { Typography } from "@mui/material";

function Home() {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh"}}>
            <div style={{ textAlign: "center" }}>
                <Typography variant="h2">Start budgeting with piggyBank</Typography>
                <p> Sign up to get started.</p>
                <Button variant="contained" sx={{ backgroundColor: "black"}}>Sign up</Button>
            </div>
            <Footer />
        </div>
    );
}

export default Home;
