import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme, useMediaQuery, AppBar, Toolbar, IconButton } from "@mui/material";
import { LayoutDashboard, Users, Globe, Phone, LineChart, Calculator, Search, Settings, Menu as MenuIcon, X } from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Leads", path: "/Leads" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Globe, label: "Websites", path: "/websites" },
  { icon: Phone, label: "Phone Numbers", path: "/phone-numbers" },
  { icon: LineChart, label: "Analytics", path: "/analytics" },
  { icon: Calculator, label: "Revenue", path: "/revenue" },
  { icon: Search, label: "Research", path: "/research" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const DRAWER_WIDTH = 240;

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box>
      <img src={`https://www.rankandrenttool.com/Rank&.png`} alt="RankRent Pro" style={{ width: 250, objectFit: "contain" }} />

      <List sx={{ pt: 2 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <ListItem
              key={item.path}
              component={Link}
              to={item.path}
              onClick={isMobile ? handleDrawerClose : undefined}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 1,
                color: isActive ? "primary.main" : "text.primary",
                backgroundColor: isActive ? "action.selected" : "transparent",
                "&:hover": {
                  backgroundColor: "action.hover",
                },
                textDecoration: "none",
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <Icon size={20} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.875rem",
                  fontWeight: isActive ? 600 : 400,
                }}
              />
            </ListItem>
          );
        })}
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%", // ensures vertical alignment within parent
            textAlign: "center", // fallback for non-flex parents
          }}
        >
          v 1.0
        </Typography>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Mobile AppBar */}
      {isMobile && (
        <AppBar
          position="fixed"
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            boxShadow: 1,
          }}
        >
          <Toolbar>
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
              {mobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
            </IconButton>
            <img src={`https://www.rankandrenttool.com/Rank&.png`} alt="RankRent Pro" style={{ width: 70, objectFit: "contain" }} />
          </Toolbar>
        </AppBar>
      )}

      {/* Navigation Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          // Mobile drawer
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerClose}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                backgroundColor: theme.palette.background.paper,
                borderRight: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          // Desktop drawer
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH,
                backgroundColor: theme.palette.background.paper,
                borderRight: `1px solid ${theme.palette.divider}`,
              },
            }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 8, md: 0 }, // Account for mobile AppBar height
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
