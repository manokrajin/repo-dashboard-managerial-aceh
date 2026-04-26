"use client";

interface HeaderProps {
  date: string;
}

export default function Header({ date }: HeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="header-top">
        <div className="header-date">
          📅 {date}
        </div>
        <img src="/bulog_logo.png" alt="BULOG Logo" className="header-logo" />
      </div>
      <div className="header-title-area">
        <h1 className="header-title">Ringkasan Operasional</h1>
        <p className="header-subtitle">Kanwil Aceh</p>
      </div>
    </header>
  );
}
