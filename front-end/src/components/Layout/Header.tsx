'use client';

import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Box,
} from '@mui/material';
import {
    AccountCircle,
    Logout,
    Settings,
    Dashboard,
    Receipt,
    Assessment,
    AccountBalance,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export const Header: React.FC = () => {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuthStore();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
        handleClose();
    };

    const handleNavigation = (path: string) => {
        router.push(path);
        handleClose();
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <AppBar position="static" sx={{ backgroundColor: '#2E7D32' }}>
            <Toolbar>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, cursor: 'pointer' }}
                    onClick={() => router.push('/dashboard')}
                >
                    ふたりの家計
                </Typography>

                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                    <Button
                        color="inherit"
                        startIcon={<Dashboard />}
                        onClick={() => router.push('/dashboard')}
                    >
                        ダッシュボード
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<Receipt />}
                        onClick={() => router.push('/expenses')}
                    >
                        支出管理
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<AccountBalance />}
                        onClick={() => router.push('/settlements')}
                    >
                        精算
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<Assessment />}
                        onClick={() => router.push('/reports')}
                    >
                        レポート
                    </Button>
                </Box>

                <Box sx={{ ml: 2 }}>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                            {user?.name?.charAt(0).toUpperCase()}
                        </Avatar>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={() => handleNavigation('/profile')}>
                            <AccountCircle sx={{ mr: 1 }} />
                            プロフィール
                        </MenuItem>
                        <MenuItem onClick={() => handleNavigation('/settings')}>
                            <Settings sx={{ mr: 1 }} />
                            設定
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <Logout sx={{ mr: 1 }} />
                            ログアウト
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}; 
