import Phaser from "phaser";

export default class MusicManager extends Phaser.Scene {
  constructor() {
    super({ key: "MusicManager" });
    this.currentTrack = null;
    this.music = {};
  }

  preload() {
    this.load.audio("home", "assets/home.mp3");
    this.load.audio("office", "assets/office.mp3");
    this.load.audio("party", "assets/party.mp3");
    this.load.audio("boo", "assets/boo.mp3");
  }

  create() {
    this.music.home = this.sound.add("home", { loop: true, volume: 0.1 });
    this.music.office = this.sound.add("office", { loop: true, volume: 0.1 });
    this.music.party = this.sound.add("party", { loop: true, volume: 0.1 });
    this.music.boo = this.sound.add("boo", { loop: true, volume: 0.1 });
  }

  playTrack(key) {
    if (this.currentTrack === key) {
      return; // already playing
    }

    if (this.currentTrack && this.music[this.currentTrack]) {
      this.music[this.currentTrack].stop(); // stop current
    }

    if (this.music[key]) {
      this.music[key].play();
      this.currentTrack = key;
    }
  }

  stopMusic() {
    if (this.currentTrack && this.music[this.currentTrack]) {
      this.music[this.currentTrack].stop();
      this.currentTrack = null;
    } else {
      console.warn('MusicManager: No valid track to stop');
    }
  }
}
