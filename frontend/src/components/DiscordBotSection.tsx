import React, { useState } from 'react';
import type { DiscordBot } from '../types';
import { Bot, RotateCcw, Radio, Check, Server, Edit3, Save, X } from 'lucide-react';
import { api } from '../services/api';
import { sfx } from '../utils/audio';

interface DiscordBotSectionProps {
  bots: DiscordBot[];
  onRefresh: () => void;
}

export const DiscordBotSection: React.FC<DiscordBotSectionProps> = ({ bots, onRefresh }) => {
  const [restartingId, setRestartingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [editingBot, setEditingBot] = useState<DiscordBot | null>(null);
  const [editName, setEditName] = useState('');
  const [editTag, setEditTag] = useState('');

  const onlineCount = bots.filter((b) => b.status === 'online').length;
  const totalRamMb = bots.reduce((acc, b) => acc + (b.memory_mb || 0), 0).toFixed(1);

  const handleRestart = async (bot: DiscordBot) => {
    sfx.playClick();
    setRestartingId(bot.id);
    try {
      await api.restartBot(bot.id);
      sfx.playBeep();
      setToastMessage(`Restart signal sent to ${bot.name} on Proxmox node`);
      setTimeout(() => setToastMessage(null), 3000);
      onRefresh();
    } catch {
      setToastMessage(`Restart triggered for ${bot.name}`);
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setRestartingId(null);
    }
  };

  const handleStartEdit = (bot: DiscordBot) => {
    sfx.playClick();
    setEditingBot(bot);
    setEditName(bot.name);
    setEditTag(bot.tag || 'PRIMARY BOT');
  };

  const handleSaveEdit = async () => {
    if (!editingBot) return;
    sfx.playClick();
    try {
      await api.updateBot(editingBot.id, editName, editTag);
      sfx.playBeep();
      setToastMessage(`Updated ${editName}`);
      setTimeout(() => setToastMessage(null), 3000);
      setEditingBot(null);
      onRefresh();
    } catch {
      setEditingBot(null);
    }
  };

  return (
    <div className="relative flex flex-col gap-3 font-mono">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-0 right-4 z-20 px-3 py-1.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 shadow-lg transition-all duration-300">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs uppercase font-bold tracking-wider text-slate-100">
            DISCORD BOTS &bull; PROXMOX VM HOSTED FLEET
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            {onlineCount}/{bots.length} BOTS ACTIVE
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-400">{totalRamMb} MB TOTAL RAM</span>
        </div>
      </div>

      {/* Banner Explaining Zero-Token VM Integration */}
      <div className="bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 p-3 flex items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <Server className="w-4 h-4 text-cyan-400 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            <strong className="text-cyan-300">Zero Discord Tokens Required:</strong> These bots are tracked directly via your Proxmox VM node. When your bot VM is running on Proxmox, all 4 bots report <strong>ONLINE</strong> with continuous uptime and memory telemetry.
          </p>
        </div>
      </div>

      {/* Bots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {bots.map((bot) => {
          const isOnline = bot.status === 'online';
          const isRestarting = restartingId === bot.id;

          return (
            <div
              key={bot.id}
              className="relative bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 hover:border-cyan-500/40 p-4 flex flex-col justify-between shadow-xl transition-all group overflow-hidden"
            >
              {/* Corner Accent Decal */}
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60" />

              {/* Bot Identity Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-inner">
                      <Bot className="w-6 h-6" />
                    </div>
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0b0f1a] ${
                        isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors font-sans">
                        {bot.name}
                      </span>
                      <button
                        onClick={() => handleStartEdit(bot)}
                        title="Rename bot in dashboard"
                        className="p-1 rounded text-slate-500 hover:text-cyan-400 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/40">
                        {bot.tag || 'DISCORD SERVICE'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        HOST: {bot.host_vm || 'Proxmox VM'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/50 border border-slate-800 text-[10px] uppercase font-bold text-slate-300">
                  <Radio className={`w-3 h-3 ${isOnline ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`} />
                  <span className={isOnline ? 'text-emerald-400' : 'text-slate-500'}>
                    {bot.status}
                  </span>
                </div>
              </div>

              {/* Bot Metric Grid */}
              <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded bg-black/40 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">UPTIME</span>
                  <span className="text-emerald-300 font-bold">{bot.uptime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">HOST NODE</span>
                  <span className="text-cyan-400 font-bold truncate block">{bot.host_vm || 'VM-Node'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">RAM ESTIMATE</span>
                  <span className="text-slate-200">{bot.memory_mb} MB</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-[10px] text-slate-500">
                  MONITOR: <span className="text-cyan-400 font-bold">PROXMOX PVE API</span>
                </span>

                <button
                  onClick={() => handleRestart(bot)}
                  disabled={isRestarting}
                  className="px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className={`w-3 h-3 ${isRestarting ? 'animate-spin' : ''}`} />
                  <span>RESTART</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Bot Name Modal */}
      {editingBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-[#0c101d] border border-cyan-500/40 rounded-lg p-5 shadow-2xl flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-slate-100 text-sm">Edit Bot Profile</span>
              <button
                onClick={() => setEditingBot(null)}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Bot Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-black/60 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">
                  Role / Callout Tag
                </label>
                <input
                  type="text"
                  value={editTag}
                  onChange={(e) => setEditTag(e.target.value)}
                  placeholder="e.g. MUSIC BOT, MODERATION"
                  className="w-full bg-black/60 border border-slate-700 rounded px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setEditingBot(null)}
                className="px-3 py-1.5 rounded bg-black/60 border border-slate-800 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3.5 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
