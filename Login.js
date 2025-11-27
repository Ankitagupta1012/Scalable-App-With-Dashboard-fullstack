import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');
  const nav = useNavigate();

  const doLogin = async(e)=>{
    e.preventDefault();
    try{
      const data = await api('/api/auth/login', { method:'POST', body:{email,password} });
      localStorage.setItem('tf_token', data.token);
      localStorage.setItem('tf_email', data.email);
      nav('/dashboard');
    } catch(err){
      setErr(err.body && err.body.message ? err.body.message : 'Login failed');
    }
  };

  const doRegister = async()=>{
    try{
      const data = await api('/api/auth/register', { method:'POST', body:{email,password} });
      localStorage.setItem('tf_token', data.token);
      localStorage.setItem('tf_email', data.email);
      nav('/dashboard');
    } catch(err){
      setErr(err.body && err.body.message ? err.body.message : 'Register failed');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100" style={{background:'#f3f5f9'}}>
      <div className="card p-4" style={{width:420}}>
        <h5 className="mb-3">Sign in / Register</h5>
        <form onSubmit={doLogin}>
          <input className="form-control mb-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="form-control mb-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <div className="text-danger mb-2">{err}</div>}
          <div className="d-flex gap-2">
            <button className="btn btn-primary" type="submit">Login</button>
            <button type="button" className="btn btn-outline-secondary" onClick={doRegister}>Register</button>
          </div>
        </form>
      </div>
    </div>
);
}