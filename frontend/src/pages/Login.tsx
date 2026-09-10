import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
import { useAuth } from '../components/AuthContext';
import type { AuthRequest } from '../types';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values: AuthRequest) => {
        setError(null);
        setIsLoading(true);
        try {
            await login(values);
            navigate('/');
        } catch {
            setError('Pogrešan email ili lozinka.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 360, margin: '64px auto' }}>
            <div className="nc-detail">
                <div className="nc-detail-body">
                    <h1 style={{ marginTop: 0 }}>Prijava</h1>
                    {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
                    <Form layout="vertical" onFinish={handleSubmit}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Unesi email' }]}>
                            <Input placeholder="Email" autoFocus />
                        </Form.Item>
                        <Form.Item name="password" label="Lozinka" rules={[{ required: true, message: 'Unesi lozinku' }]}>
                            <Input.Password placeholder="Lozinka" />
                        </Form.Item>
                        <Button className="nc-btn" htmlType="submit" loading={isLoading} style={{ width: '100%' }}>
                            Prijavi se
                        </Button>
                    </Form>
                    <p className="nc-desc" style={{ marginTop: 16, textAlign: 'center' }}>
                        Nemaš račun? <Link to="/register">Registriraj se</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
