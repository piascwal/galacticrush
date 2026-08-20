<script lang="ts">
  interface Star {
    id: number;
    left: string;
    top: string;
    delay: string;
    size: string;
  }

  const stars: Star[] = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    top: Math.random() * 100 + '%',
    delay: Math.random() * 4 + 's',
    size: (Math.random() * 1.6 + 0.6).toFixed(2) + 'px'
  }));
</script>

<div id="stars">
  {#each stars as star (star.id)}
    <div class="star" style:left={star.left} style:top={star.top} style:animation-delay={star.delay} style:width={star.size} style:height={star.size}></div>
  {/each}
</div>
