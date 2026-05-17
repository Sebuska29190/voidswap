"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, Trash2, Clock, TrendingUp, TrendingDown } from "lucide-react";

const initialAlerts = [
  {
    id: "1",
    token: "ETH",
    target: 3500,
    direction: "above" as const,
    triggered: false,
    createdAt: "2h ago",
  },
  {
    id: "2",
    token: "BTC",
    target: 95000,
    direction: "below" as const,
    triggered: false,
    createdAt: "1d ago",
  },
  {
    id: "3",
    token: "ARB",
    target: 1.2,
    direction: "above" as const,
    triggered: true,
    createdAt: "3d ago",
  },
];

const popularTokens = ["ETH", "BTC", "USDC", "SOL", "ARB", "LINK", "MATIC", "UNI"];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [showForm, setShowForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    token: "ETH",
    target: "",
    direction: "above" as "above" | "below",
  });

  const addAlert = () => {
    if (!newAlert.target) return;
    setAlerts([
      ...alerts,
      {
        id: String(Date.now()),
        token: newAlert.token,
        target: parseFloat(newAlert.target),
        direction: newAlert.direction,
        triggered: false,
        createdAt: "Just now",
      },
    ]);
    setShowForm(false);
    setNewAlert({ token: "ETH", target: "", direction: "above" });
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen pt-8 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Price Alerts</h1>
            <p className="text-gray-500 text-sm mt-1">
              Get notified when prices cross your thresholds
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-600 font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            New Alert
          </button>
        </div>

        {/* New Alert Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="glass rounded-xl p-6">
                <h3 className="font-semibold mb-4">Create Alert</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">
                      Token
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {popularTokens.map((t) => (
                        <button
                          key={t}
                          onClick={() =>
                            setNewAlert({ ...newAlert, token: t })
                          }
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                            newAlert.token === t
                              ? "bg-violet-500/20 text-violet-300"
                              : "bg-white/5 text-gray-400 hover:text-white"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-sm text-gray-400 mb-1 block">
                        Target Price (USD)
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={newAlert.target}
                        onChange={(e) =>
                          setNewAlert({ ...newAlert, target: e.target.value })
                        }
                        placeholder="0.00"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">
                        Direction
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setNewAlert({ ...newAlert, direction: "above" })
                          }
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            newAlert.direction === "above"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-white/5 text-gray-400"
                          }`}
                        >
                          <TrendingUp className="w-4 h-4" /> Above
                        </button>
                        <button
                          onClick={() =>
                            setNewAlert({ ...newAlert, direction: "below" })
                          }
                          className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            newAlert.direction === "below"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-white/5 text-gray-400"
                          }`}
                        >
                          <TrendingDown className="w-4 h-4" /> Below
                        </button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={addAlert}
                    className="w-full py-2 rounded-xl bg-violet-500 hover:bg-violet-600 font-medium transition-all"
                  >
                    Create Alert
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert List */}
        <div className="space-y-3">
          {alerts.length === 0 && (
            <div className="text-center py-20">
              <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No alerts yet. Create one above.</p>
            </div>
          )}
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass rounded-xl p-4 flex items-center justify-between ${
                alert.triggered ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    alert.direction === "above"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {alert.direction === "above" ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <TrendingDown className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="font-medium">
                    {alert.token}{" "}
                    {alert.direction === "above" ? ">" : "<"}{" "}
                    ${alert.target.toLocaleString()}
                  </div>
                  <div className="text-gray-500 text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {alert.createdAt}
                    {alert.triggered && (
                      <span className="text-yellow-400 ml-2">● Triggered</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => deleteAlert(alert.id)}
                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
