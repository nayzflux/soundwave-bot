interface SearchSong {
    album: any,
    artists: SearchArtist[],
    available_markets: string[],
    disc_number: number,
    duration_ms: number,
    explicit: boolean,
    external_ids: any,
    external_urls: any,
    href: string,
    id: string,
    is_local: boolean,
    name: string,
    popularity: number,
    preview_url: string,
    track_number: number,
    type: string,
    uri: string
}

interface SearchArtist {
    external_urls: any
    href: string
    id: string
    name: string
    type: string
    uri: string
}