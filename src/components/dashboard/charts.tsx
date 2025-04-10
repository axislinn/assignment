"use client"

import { Bar, BarChart as RechartsBarChart, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Legend } from "recharts"

const barData = [
  { name: "Electronics", value: 4000 },
  { name: "Furniture", value: 3000 },
  { name: "Clothing", value: 2000 },
  { name: "Books", value: 2780 },
  { name: "Phones", value: 1890 },
  { name: "Sports", value: 2390 },
  { name: "Home", value: 3490 },
]

const lineData = [
  { name: "Jan", value: 2400 },
  { name: "Feb", value: 1398 },
  { name: "Mar", value: 9800 },
  { name: "Apr", value: 3908 },
  { name: "May", value: 4800 },
  { name: "Jun", value: 3800 },
  { name: "Jul", value: 4300 },
  { name: "Aug", value: 5300 },
  { name: "Sep", value: 4800 },
  { name: "Oct", value: 6000 },
  { name: "Nov", value: 4000 },
  { name: "Dec", value: 7000 },
]

const pieData = [
  { name: "Electronics", value: 400 },
  { name: "Furniture", value: 300 },
  { name: "Clothing", value: 300 },
  { name: "Books", value: 200 },
  { name: "Other", value: 100 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function BarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={barData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }}
          cursor={{ fill: "var(--accent)" }}
        />
        <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export function LineChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={lineData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
        <Tooltip
          contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }}
          cursor={{ stroke: "var(--accent)" }}
        />
        <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

export function PieChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {pieData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "var(--background)", border: "1px solid var(--border)" }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  )
}
