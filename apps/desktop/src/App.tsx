import React, { useState } from 'react';
import { SimpleUsernameInput } from './components/auth/SimpleUsernameInput';
import { Button } from '@ordo-todo/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@ordo-todo/ui';
import "./App.css";

function App() {
  const [username, setUsername] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async () => {
    if (username.length >= 3) {
      // Simulate registration
      setIsRegistered(true);
      setTimeout(() => {
        alert(`Username "${username}" would be registered successfully!`);
        setIsRegistered(false);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Ordo Todo - Desktop</CardTitle>
          <p className="text-muted-foreground">
            Create your account with real-time username validation
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <SimpleUsernameInput
            value={username}
            onChange={setUsername}
            placeholder="Choose your username"
            required
            helperText="This will be part of your profile URL"
          />

          <Button
            onClick={handleRegister}
            disabled={username.length < 3 || isRegistered}
            className="w-full"
          >
            {isRegistered ? 'Creating Account...' : 'Create Account'}
          </Button>

          {username.length >= 3 && (
            <div className="text-center text-sm text-muted-foreground">
              Your profile URL will be: <code>ordo-todo.com/{username}/workspace-name</code>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
