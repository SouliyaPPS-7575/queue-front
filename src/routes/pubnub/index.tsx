import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react';
import PubNub from 'pubnub';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Container,
  Divider,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Badge,
  Tooltip,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Send,
  Wifi,
  WifiOff,
  Settings,
  History,
  Person,
  Chat,
  Close,
  Refresh
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  height: '80vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.grey[50],
}));

const MessageBubble = styled(Paper)(({ theme, isOwn, isSystem }) => ({
  padding: theme.spacing(1.5),
  maxWidth: '70%',
  backgroundColor: isSystem
    ? theme.palette.info.light
    : isOwn
      ? theme.palette.primary.main
      : theme.palette.background.paper,
  color: isSystem
    ? theme.palette.info.contrastText
    : isOwn
      ? theme.palette.primary.contrastText
      : theme.palette.text.primary,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(1),
}));

export const Route = createFileRoute('/pubnub/')({
  component: RouteComponent,
})

function RouteComponent() {
  const [pubnub, setPubnub] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [publishKey, setPublishKey] = useState('pub-c-299a157e-7974-497a-b889-80505c899ce8');
  const [subscribeKey, setSubscribeKey] = useState('sub-c-0f1fa40a-c489-11ec-a5a3-fed9c56767c0');
  const [channel, setChannel] = useState('user_1234');
  // const [userId, setUserId] = useState('user-' + Math.random().toString(36).substr(2, 9));
  const [userId, setUserId] = useState('1234');
  const [error, setError] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pubnub) {
        pubnub.unsubscribeAll();
        pubnub.removeAllListeners();
      }
    };
  }, [pubnub]);

  const connectToPubNub = async () => {
    if (!publishKey || !subscribeKey) {
      setError('Please provide both Publish and Subscribe keys');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const pubnubInstance = new PubNub({
        publishKey: publishKey,
        subscribeKey: subscribeKey,
        userId: userId,
        heartbeatInterval: 60,
        restore: true,
        ssl: true,
        keepAlive: true
      });

      // ID:      fmt.Sprintf("test_%d", time.Now().UnixNano()),
      // Type:    "info",
      // Title:   "Test Notification",
      // Message: "This is a test notification from Go backend!",
      // UserID:  userID,

      // Add listeners
      pubnubInstance.addListener({
        message: (messageEvent) => {
          const { message, publisher, timetoken } = messageEvent;
          console.log("=> msg event", messageEvent)
          const newMessage = {
            id: timetoken,
            text: message.text || message,
            sender: message.sender || publisher,
            timestamp: new Date(timetoken / 10000).toLocaleTimeString(),
            isOwn: publisher === userId
          };

          setMessages(prev => [...prev, newMessage]);
          setMessageCount(prev => prev + 1);
        },
        presence: (presenceEvent) => {
          const { action, uuid, occupancy } = presenceEvent;

          if (action === 'join') {
            setOnlineUsers(prev => [...prev.filter(u => u !== uuid), uuid]);
            if (uuid !== userId) {
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                text: `${uuid} joined the channel`,
                sender: 'System',
                timestamp: new Date().toLocaleTimeString(),
                isSystem: true
              }]);
            }
          } else if (action === 'leave' || action === 'timeout') {
            setOnlineUsers(prev => prev.filter(u => u !== uuid));
            if (uuid !== userId) {
              setMessages(prev => [...prev, {
                id: Date.now() + Math.random(),
                text: `${uuid} left the channel`,
                sender: 'System',
                timestamp: new Date().toLocaleTimeString(),
                isSystem: true
              }]);
            }
          }
        },
        status: (statusEvent) => {
          console.log('Status event:', statusEvent);
          if (statusEvent.category === 'PNConnectedCategory') {
            setConnected(true);
            setMessages(prev => [...prev, {
              id: Date.now(),
              text: 'Connected to PubNub successfully! 🎉',
              sender: 'System',
              timestamp: new Date().toLocaleTimeString(),
              isSystem: true
            }]);
          } else if (statusEvent.category === 'PNNetworkDownCategory') {
            setError('Network connection lost. Trying to reconnect...');
          } else if (statusEvent.category === 'PNReconnectedCategory') {
            setError('');
            setMessages(prev => [...prev, {
              id: Date.now(),
              text: 'Reconnected to PubNub! 🔄',
              sender: 'System',
              timestamp: new Date().toLocaleTimeString(),
              isSystem: true
            }]);
          }
        }
      });

      // Subscribe to channel
      pubnubInstance.subscribe({
        channels: [channel],
        withPresence: true
      });

      setPubnub(pubnubInstance);
      setSettingsOpen(false);

    } catch (err) {
      setError('Failed to connect to PubNub: ' + err.message);
      console.error('PubNub connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    if (pubnub) {
      pubnub.unsubscribeAll();
      pubnub.removeAllListeners();
      setPubnub(null);
      setConnected(false);
      setOnlineUsers([]);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: 'Disconnected from PubNub 👋',
        sender: 'System',
        timestamp: new Date().toLocaleTimeString(),
        isSystem: true
      }]);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !pubnub || !connected) return;

    try {
      await pubnub.publish({
        channel: channel,
        message: {
          text: currentMessage,
          sender: userId,
          timestamp: Date.now()
        }
      });
      setCurrentMessage('');
    } catch (err) {
      setError('Failed to send message: ' + err.message);
    }
  };

  const getMessageHistory = async () => {
    if (!pubnub || !connected) return;

    try {
      const result = await pubnub.history({
        channel: channel,
        count: 20,
        includeTimetoken: true
      });

      const historicalMessages = result.messages.map(msg => ({
        id: msg.timetoken,
        text: msg.entry.text || msg.entry,
        sender: msg.entry.sender || 'Unknown',
        timestamp: new Date(msg.timetoken / 10000).toLocaleTimeString(),
        isOwn: msg.entry.sender === userId
      }));

      setMessages(prev => [...historicalMessages, ...prev]);
    } catch (err) {
      console.error('Failed to fetch message history:', err);
      setError('Failed to load message history');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getAvatarColor = (username) => {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  return (
    <Container maxWidth="md" sx={{ py: 2, mt: 10 }} mt={10}>
      <StyledPaper elevation={3}>
        {/* Header */}
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <Chat sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              PubNub Real-time Chat
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Badge badgeContent={onlineUsers.length} color="success">
                <Person />
              </Badge>

              <Badge badgeContent={messageCount} color="secondary" max={99}>
                <IconButton color="inherit" onClick={() => setMessageCount(0)}>
                  <Chat />
                </IconButton>
              </Badge>

              <Tooltip title="Settings">
                <IconButton color="inherit" onClick={() => setSettingsOpen(true)}>
                  <Settings />
                </IconButton>
              </Tooltip>

              <Chip
                icon={connected ? <Wifi /> : <WifiOff />}
                label={connected ? 'Connected' : 'Disconnected'}
                color={connected ? 'success' : 'default'}
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            sx={{ m: 2, mb: 0 }}
          >
            {error}
          </Alert>
        )}

        {/* Messages Area */}
        <MessagesContainer>
          <List dense>
            {messages.length === 0 ? (
              <Box textAlign="center" mt={4}>
                <Chat sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No messages yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a conversation by sending a message!
                </Typography>
              </Box>
            ) : (
              messages.map((msg) => (
                <ListItem
                  key={msg.id}
                  sx={{
                    justifyContent: msg.isOwn ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    px: 1
                  }}
                >
                  {!msg.isOwn && !msg.isSystem && (
                    <Avatar
                      sx={{
                        bgcolor: getAvatarColor(msg.sender),
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        mr: 1,
                        mt: 0.5
                      }}
                    >
                      {msg.sender.charAt(0).toUpperCase()}
                    </Avatar>
                  )}

                  <MessageBubble
                    elevation={msg.isSystem ? 0 : 1}
                    isOwn={msg.isOwn}
                    isSystem={msg.isSystem}
                  >
                    {!msg.isSystem && (
                      <Typography variant="caption" display="block" sx={{ opacity: 0.8, mb: 0.5 }}>
                        {msg.sender} • {msg.timestamp}
                      </Typography>
                    )}
                    <Typography variant="body2">
                      {msg.text}
                    </Typography>
                  </MessageBubble>

                  {msg.isOwn && !msg.isSystem && (
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 32,
                        height: 32,
                        fontSize: 14,
                        ml: 1,
                        mt: 0.5
                      }}
                    >
                      {msg.sender.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                </ListItem>
              ))
            )}
            <div ref={messagesEndRef} />
          </List>
        </MessagesContainer>

        {/* Message Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="flex-end">
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!connected}
              multiline
              maxRows={3}
              size="small"
              variant="outlined"
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={!connected || !currentMessage.trim()}
              endIcon={<Send />}
              sx={{ minWidth: 100, height: 'fit-content' }}
            >
              Send
            </Button>
          </Stack>
        </Box>

        {/* Floating Action Buttons */}
        {connected && (
          <Box sx={{ position: 'absolute', bottom: 80, right: 16 }}>
            <Stack spacing={1}>
              <Tooltip title="Load Message History" placement="left">
                <Fab size="small" color="secondary" onClick={getMessageHistory}>
                  <History />
                </Fab>
              </Tooltip>
              <Tooltip title="Refresh Connection" placement="left">
                <Fab size="small" color="primary" onClick={() => window.location.reload()}>
                  <Refresh />
                </Fab>
              </Tooltip>
            </Stack>
          </Box>
        )}
      </StyledPaper>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">PubNub Configuration</Typography>
            <IconButton onClick={() => setSettingsOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Publish Key"
              value={publishKey}
              onChange={(e) => setPublishKey(e.target.value)}
              fullWidth
              disabled={loading || connected}
              helperText="Get your keys from dashboard.pubnub.com"
            />
            <TextField
              label="Subscribe Key"
              value={subscribeKey}
              onChange={(e) => setSubscribeKey(e.target.value)}
              fullWidth
              disabled={loading || connected}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                disabled={loading || connected}
                sx={{ flex: 1 }}
              />
              <TextField
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                disabled={loading || connected}
                sx={{ flex: 1 }}
              />
            </Stack>

            {onlineUsers.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Online Users ({onlineUsers.length})
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {onlineUsers.map(user => (
                    <Chip
                      key={user}
                      label={user}
                      size="small"
                      avatar={
                        <Avatar sx={{ bgcolor: getAvatarColor(user), width: 24, height: 24, fontSize: 12 }}>
                          {user.charAt(0).toUpperCase()}
                        </Avatar>
                      }
                    />
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          {!connected ? (
            <Button
              variant="contained"
              onClick={connectToPubNub}
              disabled={loading || !publishKey || !subscribeKey}
              startIcon={loading ? <CircularProgress size={20} /> : <Wifi />}
            >
              {loading ? 'Connecting...' : 'Connect'}
            </Button>
          ) : (
            <Button
              variant="outlined"
              onClick={disconnect}
              startIcon={<WifiOff />}
              color="error"
            >
              Disconnect
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};


