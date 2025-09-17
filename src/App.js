import React, { useState, useEffect } from "react";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function App() {
  const [income, setIncome] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Ăn uống");
  const [date, setDate] = useState("");
  const [expenses, setExpenses] = useState([]);

  // Load dữ liệu từ localStorage
  useEffect(() => {
    const savedExpenses = JSON.parse(localStorage.getItem("expenses")) || [];
    setExpenses(savedExpenses);
    const savedIncome = localStorage.getItem("income") || "";
    setIncome(savedIncome);
  }, []);

  // Lưu dữ liệu vào localStorage
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    localStorage.setItem("income", income);
  }, [expenses, income]);

  // Thêm chi tiêu mới
  const addExpense = () => {
    if (!amount || !category || !date) return;
    setExpenses([...expenses, { amount: parseFloat(amount), category, date }]);
    setAmount("");
    setDate("");
  };

  // Tổng chi tiêu hiện tại
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Tổng chi tiêu theo danh mục
  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Pie chart dữ liệu
  const pieData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#8BC34A", "#FF9800"],
        borderColor: "#fff",
        borderWidth: 2
      },
    ],
  };

  // Bar chart dữ liệu
  const barData = {
    labels: ["Thu nhập", "Chi tiêu"],
    datasets: [
      {
        label: "Số tiền (VND)",
        data: [income || 0, totalExpense],
        backgroundColor: ["#4CAF50", "#F44336"],
      },
    ],
  };

  // Dự báo chi tiêu theo tuần
  const daysWithExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((e) => new Date(e.date).getDate()))
      : 1;
  const avgDailyExpense = totalExpense / daysWithExpense;
  const predictedExpense = avgDailyExpense * 30;

  // Tổng hợp chi tiêu theo tháng
  const monthlyTotals = {};
  expenses.forEach((e) => {
    const month = new Date(e.date).toLocaleString("default", { month: "short", year: "numeric" });
    monthlyTotals[month] = (monthlyTotals[month] || 0) + e.amount;
  });

  const lineData = {
    labels: Object.keys(monthlyTotals),
    datasets: [
      {
        label: "Chi tiêu theo tháng",
        data: Object.values(monthlyTotals),
        borderColor: "#FF5733",
        backgroundColor: "#FFCDD2",
        fill: true,
        tension: 0.4
      },
    ],
  };

  const savingsSuggestion = income - totalExpense > 0 ? income - totalExpense : 0;

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", fontFamily: "Arial, sans-serif", padding: "10px" }}>
      <h1>Trợ lý tài chính cá nhân (Cấp 1 → 3 nâng cấp UI)</h1>

      {/* Nhập thu nhập */}
      <div>
        <h3>Nhập thu nhập tháng</h3>
        <input
          type="number"
          value={income}
          placeholder="Thu nhập"
          onChange={(e) => setIncome(e.target.value)}
        />
      </div>

      <hr />

      {/* Nhập chi tiêu */}
      <div>
        <h3>Thêm chi tiêu</h3>
        <input
          type="number"
          value={amount}
          placeholder="Số tiền"
          onChange={(e) => setAmount(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>Ăn uống</option>
          <option>Đi lại</option>
          <option>Giải trí</option>
          <option>Khác</option>
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={addExpense}>Thêm</button>
      </div>

      <hr />

      {/* Tiền dư hiện tại */}
      <div style={{ fontSize: "18px", margin: "10px 0" }}>
        <strong>Dư hiện tại: </strong>
        <span style={{ color: income - totalExpense >= 0 ? "green" : "red" }}>
          {income - totalExpense} VND
        </span>
      </div>

      {/* Bảng chi tiêu */}
      <h3>Danh sách chi tiêu</h3>
      <table border="1" cellPadding="5" style={{ width: "100%", textAlign: "left" }}>
        <thead>
          <tr>
            <th>Ngày</th>
            <th>Danh mục</th>
            <th>Số tiền (VND)</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e, i) => {
            let bgColor = "";
            if (e.category === "Ăn uống") bgColor = "#FFEBEE";
            else if (e.category === "Đi lại") bgColor = "#E3F2FD";
            else if (e.category === "Giải trí") bgColor = "#FFF3E0";
            else bgColor = "#E8F5E9";

            return (
              <tr key={i} style={{ backgroundColor: bgColor }}>
                <td>{e.date}</td>
                <td>{e.category}</td>
                <td>{e.amount}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <hr />

      {/* Bar chart */}
      <h3>Biểu đồ tổng quan</h3>
      <Bar data={barData} />

      {/* Pie chart */}
      <h3>Phân bố chi tiêu theo danh mục</h3>
      <Pie data={pieData} />

      {/* Line chart */}
      <h3>Xu hướng chi tiêu theo tháng</h3>
      <Line data={lineData} />

      {/* Cảnh báo chi tiêu vượt thu nhập */}
      {totalExpense > income && (
        <p style={{ color: "red", backgroundColor: "#FFEBEE", padding: "5px 10px", borderRadius: "5px" }}>
          ⚠️ Chi tiêu vượt thu nhập!
        </p>
      )}

      {/* Gợi ý tiết kiệm */}
      {savingsSuggestion > 0 && (
        <p style={{ color: "green", backgroundColor: "#E8F5E9", padding: "5px 10px", borderRadius: "5px" }}>
          💰 Gợi ý tiết kiệm: bạn có thể để dành {savingsSuggestion} VND
        </p>
      )}

      {/* Dự báo chi tiêu */}
      {predictedExpense > income && (
        <p style={{ color: "orange", backgroundColor: "#FFF3E0", padding: "5px 10px", borderRadius: "5px" }}>
          ⚠️ Dự báo: Nếu chi tiêu tiếp tục như hiện tại, bạn có thể vượt thu nhập trong tháng!
        </p>
      )}
    </div>
  );
}

export default App;
