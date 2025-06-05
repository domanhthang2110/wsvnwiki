export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Welcome to Warspear Wiki</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Your comprehensive guide to the world of Warspear. Explore classes, read guides, and dive into the rich lore of the game.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-lg border bg-card">
          <h2 className="text-2xl font-semibold mb-3">Classes</h2>
          <p className="text-muted-foreground">
            Discover detailed information about all available classes, their skills, and playstyles.
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-card">
          <h2 className="text-2xl font-semibold mb-3">Guides</h2>
          <p className="text-muted-foreground">
            Learn from experienced players with our comprehensive guides and tutorials.
          </p>
        </div>

        <div className="p-6 rounded-lg border bg-card">
          <h2 className="text-2xl font-semibold mb-3">Lore</h2>
          <p className="text-muted-foreground">
            Immerse yourself in the rich story and history of the Warspear universe.
          </p>
        </div>
      </div>
    </div>
  );
}
