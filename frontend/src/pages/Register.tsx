import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
import { useAuth } from '../components/AuthContext';
import type { AuthRequest } from '../types';

function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values: AuthRequest) => {
        setError(null);
        setIsLoading(true);
        try {
            await register(values);
            navigate('/');
        } catch (e: unknown) {
            const status = (e as { response?: { status?: number } })?.response?.status;
            setError(status === 409 ? 'Email je već registriran.' : 'Greška pri registraciji.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 360, margin: '64px auto' }}>
            <div className="nc-detail">
                <div className="nc-detail-body">
                    <h1 style={{ marginTop: 0 }}>Registracija</h1>
                    {error && <Alert type="error" message={error} showIcon style={{ marginBottom: 16 }} />}
                    <Form layout="vertical" onFinish={handleSubmit}>
                        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Unesi ispravan email' }]}>
                            <Input placeholder="Email" autoFocus />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            label="Lozinka"
                            rules={[
                                { required: true, message: 'Unesi lozinku' },
                                { min: 8, message: 'Lozinka mora imati barem 8 znakova' },
                            ]}
                        >
                            <Input.Password placeholder="Lozinka" />
                        </Form.Item>
                        <Button className="nc-btn" htmlType="submit" loading={isLoading} style={{ width: '100%' }}>
                            Registriraj se
                        </Button>
                    </Form>
                    <p className="nc-desc" style={{ marginTop: 16, textAlign: 'center' }}>
                        Već imaš račun? <Link to="/login">Prijavi se</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
