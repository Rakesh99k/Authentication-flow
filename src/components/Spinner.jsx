// lightweight spinner component used during async operations
import React from 'react'
import '../styles/global.css'

export default function Spinner({ size = 24 }) {
  // simple CSS-based rotating circle
  return (
    <div
      className="spinner"
      style={{ width: size, height: size, borderWidth: Math.max(2, size / 8) }}
    />
  )
}
