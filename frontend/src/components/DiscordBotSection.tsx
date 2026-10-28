import React, { useState } from 'react';
import type { DiscordBot } from '../types';
import { Bot, RotateCcw, Radio, Check, Terminal } from 'lucide-react';
import { api } from '../services/api';
import { sfx } from '../utils/audio';

interface DiscordBotSectionProps {
  bots: DiscordBot[];
  onRefresh: () => void;
}

export const DiscordBotSection: React.FC<DiscordBotSectionProps> = ({ bots, onRefresh }) => {
  const [restartingId, setRestartingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [inspectBot, setInspectBot] = useState<DiscordBot | null>(null);

  const onlineCount = bots.filter((b) => b.status === 'online').length;
  const totalRamMb = bots.reduce((acc, b) => acc + (b.memory_mb || 0), 0).toFixed(1);
  const avgPing = Math.round(bots.reduce((acc, b) => acc + (b.ping_ms || 0), 0) / Math.max(bots.length, 1));

  const handleRestart = async (bot: DiscordBot) => {
    sfx.playClick();
    setRestartingId(bot.id);
    try {
      await api.restartBot(bot.id);
      sfx.playBeep();
      setToastMessage(`Signal received: ${bot.name} reloaded successfully`);
      setTimeout(() => setToastMessage(null), 3000);
      onRefresh();
    } catch {
      setToastMessage(`Restart triggered for ${bot.name}`);
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setRestartingId(null);
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
            DISCORD BOT SQUADRON &bull; FLEET TELEMETRY
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            {onlineCount}/{bots.length} ACTIVE
          </span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-cyan-400">{avgPing}ms AVG PING</span>
          <span className="text-slate-500">&bull;</span>
          <span className="text-slate-400">{totalRamMb} MB TOTAL RAM</span>
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
                    {bot.avatar_url ? (
                      <img
                        src={bot.avatar_url}
                        alt={bot.name}
                        className="w-11 h-11 rounded-lg border border-slate-700 object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-600/30 to-blue-700/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                        <Bot className="w-6 h-6" />
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0b0f1a] ${
                        isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-rose-500'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors font-sans">
                      {bot.name}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-cyan-400 uppercase font-bold px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/40">
                        {bot.tag || 'DISCORD SERVICE'}
                      </span>
                      {bot.version && (
                        <span className="text-[10px] text-slate-500">{bot.version}</span>
                      )}
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
              <div className="grid grid-cols-4 gap-2 my-3 p-2.5 rounded bg-black/40 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">UPTIME</span>
                  <span className="text-emerald-300 font-bold">{bot.uptime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">GATEWAY</span>
                  <span className="text-cyan-400 font-bold">{bot.ping_ms} ms</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">RAM USE</span>
                  <span className="text-slate-200">{bot.memory_mb} MB</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">SERVERS</span>
                  <span className="text-amber-300 font-bold">{bot.guilds ?? '—'}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                <span className="text-[10px] text-slate-500">
                  PREFIX: <span className="text-cyan-400 font-bold">{bot.prefix || '/'}</span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sfx.playClick();
                      setInspectBot(bot);
                    }}
                    className="px-2 py-1 rounded bg-black/50 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-slate-100 transition-colors"
                  >
                    SPECS
                  </button>

                  <button
                    onClick={() => handleRestart(bot)}
                    disabled={isRestarting}
                    className="px-2.5 py-1 rounded bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-[10px] text-cyan-300 font-bold flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className={`w-3 h-3 ${isRestarting ? 'animate-spin' : ''}`} />
                    <span>RELOAD</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Setup Tip Footer Banner */}
      <div className="bg-[#0b0f1a]/85 backdrop-blur-md rounded-lg border border-cyan-500/20 p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>
            <strong>How Bot Discovery Works:</strong> SaintDash automatically maps any Docker container containing <code className="text-cyan-300">bot</code> or <code className="text-cyan-300">discord</code> in its name. You can also add <code className="text-cyan-300">DISCORD_BOT_TOKENS=...</code> in <code className="text-slate-200">.env</code> to stream live Discord Gateway presence!
          </span>
        </div>
      </div>

      {/* Bot Inspect Modal */}
      {inspectBot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[#0c101d] border border-cyan-500/40 rounded-lg p-5 shadow-2xl flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-slate-100 text-sm">{inspectBot.name}</span>
              <button
                onClick={() => setInspectBot(null)}
                className="text-slate-400 hover:text-slate-100 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-2 text-slate-300">
              <div className="p-3 bg-black/40 rounded border border-slate-800 space-y-1 text-[11px]">
                <div><span className="text-slate-500">Bot ID:</span> {inspectBot.id}</div>
                <div><span className="text-slate-500">Framework / Type:</span> {inspectBot.type}</div>
                <div><span className="text-slate-500">Active Uptime:</span> {inspectBot.uptime}</div>
                <div><span className="text-slate-500">Gateway Latency:</span> {inspectBot.ping_ms} ms</div>
                <div><span className="text-slate-500">Memory Allocation:</span> {inspectBot.memory_mb} MB</div>
                <div><span className="text-slate-500">Command Prefix:</span> {inspectBot.prefix || '/'}</div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setInspectBot(null)}
                className="px-4 py-1.5 rounded bg-black/60 border border-slate-800 text-slate-300 hover:text-slate-100"
              >
                DISMISS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
