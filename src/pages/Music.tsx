import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Music as MusicIcon } from "lucide-react";


type Track = {
  title: string;
  artist: string;
  youtubeId: string;
  lyrics: string;
};

const tracks: Track[] = [
  {
    title: "Panaginip",
    artist: "Nicole",
    youtubeId: "n5A6bpwFOTs",
    lyrics: `Ilang beses na bang nakita kita sa panaginip ko?
Ilang beses na bang tayo'y magkasama sa panaginip ko?
At kahit alam kong hindi totoo
Ayaw kong magising, gusto ko pang makapiling ka

Sana'y panaginip na lang ako
Nang sa gano'n hindi kita mawawala
Sana'y panaginip na lang tayo
Nang sa gano'n magkatabi tayo palagi

Bakit ba parang ang bilis ng oras kapag kasama kita?
Bakit ba parang ang tagal kapag ika'y nawawala?
At kahit alam kong hindi totoo
Ayaw kong magising, gusto ko pang makapiling ka

Sana'y panaginip na lang ako
Nang sa gano'n hindi kita mawawala
Sana'y panaginip na lang tayo
Nang sa gano'n magkatabi tayo palagi

Sana'y panaginip na lang tayo
Nang sa gano'n magkatabi tayo palagi`,
  },
  {
    title: "Hold On Till May",
    artist: "Pierce The Veil",
    youtubeId: "AgTVh_z5Ha0",
    lyrics: `She sits up high, surrounded by the sun
One shoulder leaning north
And one toward the coming storm
Sometimes it rains inside her mind
And she prepares to fall
But she was born to ride the lightning

So through her tears she'd laugh
And grabbed a photograph and said
"Baby, sometimes love just ain't enough"

Please, darling, hold on till May
And watch the flowers bloom
There is so much more here in this world
Than only me and you

'Cause when I close my eyes and dream
Your face is what I recognize
But all of the trees keep bowing down to my queen

So through her tears she'd laugh
And grabbed a photograph and said
"Baby, sometimes love just ain't enough"

Please, darling, hold on till May
And watch the flowers bloom
There is so much more here in this world
Than only me and you

Please, darling, hold on till May
And watch the flowers bloom
There is so much more here in this world
Than only me and you

Petals in her hair
It doesn't matter if we die
This forest is our home
Winter has passed and I'm still not there

Please, darling, hold on till May
And watch the flowers bloom
There is so much more here in this world
Than only me and you`,
  },
];

const Music = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <section className="pt-28 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <MusicIcon className="w-6 h-6 text-primary" />
              <span className="text-xs uppercase tracking-[0.45em] text-muted-foreground font-normal">
                Playlist
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight">
              Music<span className="text-primary">.</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-xl">
              Songs I keep coming back to. Press play, read along.
            </p>
          </motion.div>

          <div className="space-y-24">
            {tracks.map((track, i) => (
              <motion.section
                key={track.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="mb-6">
                  <h2 className="font-display text-3xl md:text-4xl font-bold">
                    {track.title}
                  </h2>
                  <p className="text-muted-foreground mt-1 tracking-[0.2em] text-sm uppercase">
                    {track.artist}
                  </p>
                </div>

                <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-lg border border-border mb-8">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${track.youtubeId}`}
                    title={`${track.title} — ${track.artist}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 md:p-10">
                  <h3 className="text-xs uppercase tracking-[0.45em] text-muted-foreground mb-6">
                    Lyrics
                  </h3>
                  <pre className="whitespace-pre-wrap font-sans text-base md:text-lg leading-relaxed text-foreground/90">
                    {track.lyrics}
                  </pre>
                </div>
              </motion.section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Music;
