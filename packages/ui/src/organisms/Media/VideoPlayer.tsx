import React, { useState, useRef, useEffect } from "react";
import { Icon } from "../../atoms/Icons";
import { Badge } from "../../atoms/Badges/Badge";
import "./Media.css";

export interface VideoPlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Video source URL (MP4, WebM, etc.)
   */
  src: string;

  /**
   * Poster image URL before playback starts
   */
  poster?: string;

  /**
   * Video title displayed in top header overlay
   */
  title?: string;

  /**
   * Subtitle / description displayed in top header overlay
   */
  subtitle?: string;

  /**
   * Auto-start playback on mount
   * @default false
   */
  autoPlay?: boolean;

  /**
   * Loop video playback
   * @default false
   */
  loop?: boolean;

  /**
   * Mute audio initially
   * @default false
   */
  muted?: boolean;

  /**
   * Aspect ratio scaling ('16:9' | '4:3' | '21:9' | 'auto')
   * @default '16:9'
   */
  aspectRatio?: "16:9" | "4:3" | "21:9" | "auto";
}

export function VideoPlayer({
  src,
  poster,
  title,
  subtitle,
  autoPlay = false,
  loop = false,
  muted: initialMuted = false,
  aspectRatio = "16:9",
  className = "",
  style,
  ...props
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize playback state
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error("Picture in Picture error:", err);
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      Math.max(0, videoRef.current.currentTime + seconds),
      duration
    );

    setSeekRipple({
      type: seconds < 0 ? "rewind" : "forward",
      id: Date.now(),
    });

    if (rippleTimeoutRef.current) clearTimeout(rippleTimeoutRef.current);
    rippleTimeoutRef.current = setTimeout(() => {
      setSeekRipple(null);
    }, 700);
  };

  // Auto-hide controls during playback
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 2500);
    }
  };

  const [isPiP, setIsPiP] = useState(false);

  // Sync state when entering/exiting Picture-in-Picture mode
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnterPiP = () => setIsPiP(true);
    const handleLeavePiP = () => setIsPiP(false);

    video.addEventListener("enterpictureinpicture", handleEnterPiP);
    video.addEventListener("leavepictureinpicture", handleLeavePiP);
    return () => {
      video.removeEventListener("enterpictureinpicture", handleEnterPiP);
      video.removeEventListener("leavepictureinpicture", handleLeavePiP);
    };
  }, []);

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"main" | "quality" | "subtitles" | "audio">("main");
  const [quality, setQuality] = useState("Auto (1080p)");
  const [subtitles, setSubtitles] = useState<"Off" | "English [CC]" | "Spanish" | "French">("English [CC]");
  const [audioTrack, setAudioTrack] = useState("English (Original 5.1)");

  const [bufferedTime, setBufferedTime] = useState(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState(0);
  const [seekRipple, setSeekRipple] = useState<{ type: "rewind" | "forward"; id: number } | null>(null);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const rippleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleSubtitlesQuick = () => {
    setSubtitles((prev) => (prev === "Off" ? "English [CC]" : "Off"));
  };

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const end = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
      setBufferedTime(end);
    }
  };

  // Sync state when exiting fullscreen via ESC or browser UI
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (e.key === "Escape") {
        if (showShortcutsModal) {
          setShowShortcutsModal(false);
        } else if (document.pictureInPictureElement) {
          e.preventDefault();
          document.exitPictureInPicture().catch((err) => console.error(err));
        }
      } else if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShowShortcutsModal((prev) => !prev);
      } else if (e.code === "Space" || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "c") {
        e.preventDefault();
        toggleSubtitlesQuick();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skipTime(-5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skipTime(5);
      } else if (/^[0-9]$/.test(e.key) && duration > 0) {
        e.preventDefault();
        const digit = parseInt(e.key, 10);
        const targetTime = duration * (digit * 0.1);
        if (videoRef.current) {
          videoRef.current.currentTime = targetTime;
          setCurrentTime(targetTime);
          if (digit === 0) {
            videoRef.current.play().catch((err) => console.error(err));
            setIsPlaying(true);
          }
        }
        setSeekRipple({
          type: digit === 0 ? "rewind" : "forward",
          id: Date.now(),
        });
        if (rippleTimeoutRef.current) clearTimeout(rippleTimeoutRef.current);
        rippleTimeoutRef.current = setTimeout(() => {
          setSeekRipple(null);
        }, 700);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, duration]);

  // Format seconds to timecode MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={[
        "bs-video-player",
        `bs-video-player--${aspectRatio.replace(":", "-")}`,
        isFullscreen ? "bs-video-player--fullscreen" : "",
        showControls ? "bs-video-player--show-controls" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={style}
      {...props}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        loop={loop}
        muted={initialMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        className="bs-video-player-element"
      />

      {/* Animated Seek Ripple Overlay (+10s / -10s) */}
      {seekRipple && (
        <div
          key={seekRipple.id}
          className={[
            "bs-video-seek-ripple",
            `bs-video-seek-ripple--${seekRipple.type}`,
          ].join(" ")}
        >
          <Icon
            name={seekRipple.type === "rewind" ? "ArrowLeft" : "ArrowRight"}
            size={24}
          />
          <span>{seekRipple.type === "rewind" ? "-5s" : "+5s"}</span>
        </div>
      )}

      {/* Subtitles / Closed Captions Overlay */}
      {subtitles !== "Off" && (
        <div
          className={[
            "bs-video-captions-overlay",
            showControls ? "bs-video-captions-overlay--raised" : "",
          ].join(" ")}
        >
          <span className="bs-video-captions-text">
            {subtitles === "English [CC]" && "[Narrator] Demonstrating high-throughput telemetry stream processing..."}
            {subtitles === "Spanish" && "[Narrador] Demostración de procesamiento de datos en tiempo real..."}
            {subtitles === "French" && "[Narrateur] Démonstration du traitement des données en temps réel..."}
          </span>
        </div>
      )}

      {/* Keyboard Shortcuts Modal Cheat Sheet */}
      {showShortcutsModal && (
        <div
          className="bs-video-shortcuts-modal-backdrop"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="bs-video-shortcuts-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bs-video-shortcuts-header">
              <h4>Keyboard Shortcuts</h4>
              <button
                type="button"
                onClick={() => setShowShortcutsModal(false)}
                className="bs-video-control-btn"
              >
                <Icon name="Close" size={16} />
              </button>
            </div>
            <div className="bs-video-shortcuts-grid">
              <div className="bs-video-shortcut-item">
                <kbd>Space</kbd> / <kbd>k</kbd>
                <span>Play / Pause</span>
              </div>
              <div className="bs-video-shortcut-item">
                <kbd>f</kbd>
                <span>Fullscreen Toggle</span>
              </div>
              <div className="bs-video-shortcut-item">
                <kbd>m</kbd>
                <span>Mute / Unmute</span>
              </div>
              <div className="bs-video-shortcut-item">
                <kbd>c</kbd>
                <span>Captions / Subtitles</span>
              </div>
              <div className="bs-video-shortcut-item">
                <kbd>←</kbd> / <kbd>→</kbd>
                <span>Seek 5 Seconds</span>
              </div>
              <div className="bs-video-shortcut-item">
                <kbd>0</kbd> – <kbd>9</kbd>
                <span>Seek to 0% – 90%</span>
              </div>
              <div className="bs-video-shortcut-item">
                <kbd>ESC</kbd>
                <span>Exit Fullscreen / PiP / Modal</span>
              </div>
              <div className="bs-video-shortcut-item">
                <kbd>?</kbd>
                <span>Show / Hide Shortcuts</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Overlay */}
      {(title || subtitle) && (
        <div
          className={[
            "bs-video-header-overlay",
            showControls ? "bs-video-header-overlay--visible" : "",
          ].join(" ")}
        >
          <div className="bs-video-header-info">
            {title && <h4 className="bs-video-title">{title}</h4>}
            {subtitle && <p className="bs-video-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="bs-video-control-btn"
            onClick={() => setShowShortcutsModal(true)}
            title="Keyboard Shortcuts (?)"
            style={{ width: "auto", padding: "0 8px", gap: 4, fontSize: 12 }}
          >
            <Icon name="HelpCircle" size={16} />
            <span>Shortcuts</span>
          </button>
        </div>
      )}

      {/* Center Big Play Button Overlay */}
      {(!isPlaying || showControls) && (
        <button
          type="button"
          className="bs-video-center-play-btn"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause video" : "Play video"}
        >
          <Icon name={isPlaying ? "Pause" : "Play"} size={32} />
        </button>
      )}

      {/* Floating Bottom Controls Bar */}
      <div
        className={[
          "bs-video-controls-bar",
          showControls ? "bs-video-controls-bar--visible" : "",
        ].join(" ")}
      >
        {/* Seek Progress Bar with Buffered Track & Hover Timestamp Tooltip */}
        <div
          className="bs-video-seek-container"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            setHoverPos(pos * 100);
            setHoverTime(pos * duration);
          }}
          onMouseLeave={() => setHoverTime(null)}
        >
          {/* Hover Timestamp Scrubber Tooltip */}
          {hoverTime !== null && (
            <div
              className="bs-video-seek-hover-tooltip"
              style={{ left: `${hoverPos}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Buffered Stream Progress Bar */}
          <div
            className="bs-video-seek-buffer"
            style={{
              width: `${duration ? (bufferedTime / duration) * 100 : 0}%`,
            }}
          />

          {/* Played Progress Bar */}
          <div
            className="bs-video-seek-fill"
            style={{ width: `${progressPercent}%` }}
          />

          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="bs-video-seek-input"
          />
        </div>

        {/* Action Controls Row */}
        <div className="bs-video-controls-row">
          <div className="bs-video-controls-left">
            {/* Play/Pause */}
            <button
              type="button"
              className="bs-video-control-btn"
              onClick={togglePlay}
              title={isPlaying ? "Pause (k)" : "Play (k)"}
            >
              <Icon name={isPlaying ? "Pause" : "Play"} size={18} />
            </button>

            {/* Skip Back / Forward */}
            <button
              type="button"
              className="bs-video-control-btn"
              onClick={() => skipTime(-10)}
              title="Rewind 10s"
            >
              <Icon name="ArrowLeft" size={16} />
            </button>
            <button
              type="button"
              className="bs-video-control-btn"
              onClick={() => skipTime(10)}
              title="Forward 10s"
            >
              <Icon name="ArrowRight" size={16} />
            </button>

            {/* Volume Control */}
            <div className="bs-video-volume-group">
              <button
                type="button"
                className="bs-video-control-btn"
                onClick={toggleMute}
                title={isMuted ? "Unmute (m)" : "Mute (m)"}
              >
                <Icon
                  name={isMuted || volume === 0 ? "VolumeOff" : "VolumeHigh"}
                  size={18}
                />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="bs-video-volume-slider"
              />
            </div>

            {/* Timecode */}
            <div className="bs-video-timecode">
              <span>{formatTime(currentTime)}</span>
              <span className="bs-video-timecode-sep">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="bs-video-controls-right">
            {/* Subtitles / Closed Captions Toggle */}
            <button
              type="button"
              className={[
                "bs-video-control-btn",
                subtitles !== "Off" ? "bs-video-control-btn--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={toggleSubtitlesQuick}
              title={`Subtitles / Captions (${subtitles})`}
              aria-label="Toggle Subtitles"
            >
              <Icon name="Subtitle" size={18} />
            </button>

            {/* Speed Selector Menu */}
            <div className="bs-video-speed-wrapper">
              <button
                type="button"
                className="bs-video-speed-btn"
                onClick={() => {
                  setShowSpeedMenu(!showSpeedMenu);
                  setShowSettingsMenu(false);
                }}
              >
                {playbackRate}x
              </button>

              {showSpeedMenu && (
                <div className="bs-video-speed-menu">
                  {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((rate) => (
                    <div
                      key={rate}
                      className={[
                        "bs-video-speed-option",
                        playbackRate === rate ? "bs-video-speed-option--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleSpeedChange(rate)}
                    >
                      {rate === 1.0 ? "Normal (1x)" : `${rate}x`}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings Gear Icon & OTT Menu */}
            <div className="bs-video-settings-wrapper">
              <button
                type="button"
                className={[
                  "bs-video-control-btn",
                  showSettingsMenu ? "bs-video-control-btn--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setSettingsTab("main");
                  setShowSpeedMenu(false);
                }}
                title="Player Settings (Quality, Subtitles, Audio)"
                aria-label="Player Settings"
              >
                <Icon name="Settings" size={18} />
              </button>

              {showSettingsMenu && (
                <div className="bs-video-settings-menu">
                  {settingsTab === "main" && (
                    <>
                      <div
                        className="bs-video-settings-item"
                        onClick={() => setSettingsTab("quality")}
                      >
                        <span className="bs-video-settings-label">Quality</span>
                        <div className="bs-video-settings-val">
                          <span>{quality}</span>
                          <Icon name="ArrowRight" size={14} />
                        </div>
                      </div>

                      <div
                        className="bs-video-settings-item"
                        onClick={() => setSettingsTab("subtitles")}
                      >
                        <span className="bs-video-settings-label">Subtitles / CC</span>
                        <div className="bs-video-settings-val">
                          <span>{subtitles}</span>
                          <Icon name="ArrowRight" size={14} />
                        </div>
                      </div>

                      <div
                        className="bs-video-settings-item"
                        onClick={() => setSettingsTab("audio")}
                      >
                        <span className="bs-video-settings-label">Audio Track</span>
                        <div className="bs-video-settings-val">
                          <span>{audioTrack}</span>
                          <Icon name="ArrowRight" size={14} />
                        </div>
                      </div>
                    </>
                  )}

                  {settingsTab === "quality" && (
                    <>
                      <div
                        className="bs-video-settings-back"
                        onClick={() => setSettingsTab("main")}
                      >
                        <Icon name="ArrowLeft" size={14} />
                        <span>Quality</span>
                      </div>
                      {["Auto (1080p)", "1080p Ultra HD", "720p HD", "Data Saver (480p)"].map((q) => (
                        <div
                          key={q}
                          className={[
                            "bs-video-settings-option",
                            quality === q ? "bs-video-settings-option--active" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => {
                            setQuality(q);
                            setShowSettingsMenu(false);
                          }}
                        >
                          {q}
                        </div>
                      ))}
                    </>
                  )}

                  {settingsTab === "subtitles" && (
                    <>
                      <div
                        className="bs-video-settings-back"
                        onClick={() => setSettingsTab("main")}
                      >
                        <Icon name="ArrowLeft" size={14} />
                        <span>Subtitles / CC</span>
                      </div>
                      {(["Off", "English [CC]", "Spanish", "French"] as const).map((sub) => (
                        <div
                          key={sub}
                          className={[
                            "bs-video-settings-option",
                            subtitles === sub ? "bs-video-settings-option--active" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => {
                            setSubtitles(sub);
                            setShowSettingsMenu(false);
                          }}
                        >
                          {sub}
                        </div>
                      ))}
                    </>
                  )}

                  {settingsTab === "audio" && (
                    <>
                      <div
                        className="bs-video-settings-back"
                        onClick={() => setSettingsTab("main")}
                      >
                        <Icon name="ArrowLeft" size={14} />
                        <span>Audio Track</span>
                      </div>
                      {["English (Original 5.1)", "Spanish (Dubbed)", "French (Dubbed)"].map((aud) => (
                        <div
                          key={aud}
                          className={[
                            "bs-video-settings-option",
                            audioTrack === aud ? "bs-video-settings-option--active" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={() => {
                            setAudioTrack(aud);
                            setShowSettingsMenu(false);
                          }}
                        >
                          {aud}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <button
              type="button"
              className={[
                "bs-video-control-btn",
                "bs-video-pip-btn",
                isPiP ? "bs-video-control-btn--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={togglePiP}
              title={isPiP ? "Exit Picture in Picture (ESC)" : "Picture in Picture"}
              aria-label="Picture in Picture"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <rect
                  x="12"
                  y="11"
                  width="8"
                  height="7"
                  rx="1"
                  fill="currentColor"
                  fillOpacity={isPiP ? "0.8" : "0.35"}
                />
              </svg>
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              className="bs-video-control-btn"
              onClick={toggleFullscreen}
              title="Fullscreen (f)"
            >
              <Icon name={isFullscreen ? "Minimize" : "Maximize"} size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
