const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylist(userId) {
    const playlistQuery = {
      text: `
        SELECT DISTINCT playlists.id, playlists.name, users.username
        FROM playlists
        JOIN users ON playlists.owner = users.id
        LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
        WHERE playlists.owner = $1 OR collaborations.user_id = $1
      `,
      values: [userId],
    };
    
    const playlistResult = await this._pool.query(playlistQuery);
    if (playlistResult.rows.length === 0) {
      return null;
    }

    const playlist = playlistResult.rows[0];

    const songsQuery = {
      text: `
        SELECT songs.id, songs.title, songs.performer
        FROM songs
        JOIN playlistsongs ON songs.id = playlistsongs.song_id
        WHERE playlistsongs.playlist_id = $1
      `,
      values: [playlist.id],
    };

    const songsResult = await this._pool.query(songsQuery);

    return {
      playlist: {
        id: playlist.id,
        name: playlist.name,
        songs: songsResult.rows,
      },
    };
  }
}

module.exports = PlaylistsService;