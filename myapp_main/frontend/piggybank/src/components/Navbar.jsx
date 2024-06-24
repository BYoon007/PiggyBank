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
        <Typography variant="h5" sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "8px" }}>🐖</span>
          piggyBank
        </Typography>
        <Container sx={{ display: "flex", justifyContent: "center"}}>
          <MenuItem sx={{ fontWeight: "bold"}}>Home</MenuItem>
          <MenuItem sx={{ fontWeight: "bold"}}>Login</MenuItem>
          <MenuItem sx={{ fontWeight: "bold"}}>Contact</MenuItem>
        </Container>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
