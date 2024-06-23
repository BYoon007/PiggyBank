import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Container, MenuItem } from "@mui/material";

const Navbar = () => {
  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "transparent",
        color: "black",
        boxShadow: "none",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar>
        <Typography variant="h5">piggyBank</Typography>
        <Container sx={{ display: "flex", justifyContent: "center"}}>
          <MenuItem>Home</MenuItem>
          <MenuItem>Login</MenuItem>
          <MenuItem>Contact</MenuItem>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
