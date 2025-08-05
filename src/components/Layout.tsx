import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, useTheme, useMediaQuery, AppBar, Toolbar, IconButton, Button, Avatar, Menu, MenuItem } from "@mui/material";
import { LayoutDashboard, Users, Globe, Phone, LineChart, Calculator, Search, Settings, Menu as MenuIcon, X, LogOut, User, CheckSquare } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Leads", path: "/Leads" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: CheckSquare, label: "Checklists", path: "/checklists" },
  { icon: LineChart, label: "Analytics", path: "/analytics" },
  // { icon: Globe, label: "Websites", path: "/websites" },
  { icon: Phone, label: "Phone Numbers", path: "/phone-numbers" },
  // { icon: Calculator, label: "Revenue", path: "/revenue" },
  // { icon: Search, label: "Research", path: "/research" },
  // { icon: Settings, label: "Settings", path: "/settings" },
];

const DRAWER_WIDTH = 240;

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose();
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
        <MenuItem onClick={handleLogout}>
          <ListItemIcon sx={{ pl: 1 }}>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText sx={{ pl: 1.6 }}>Logout</ListItemText> {/* ← padding-left of 1 (8px) */}
        </MenuItem>

        <Typography
          variant="subtitle2"
          fontWeight="bold"
          sx={{
            display: "flex",
            paddingTop: "30px",
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
            <Box sx={{ flexGrow: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
                {user?.name}
              </Typography>
              <IconButton size="small" onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>{user?.name?.charAt(0).toUpperCase()}</Avatar>
              </IconButton>
            </Box>
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

      {/* User Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <User size={20} />
          </ListItemIcon>
          <ListItemText>
            <Typography variant="body2">{user?.email}</Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogOut size={20} />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
}
