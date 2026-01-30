import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';

const run = async () => {
  await imagemin(['public/icons/*.png'], {
    destination: 'public/icons-optimized',
    plugins: [
      imageminPngquant({
        quality: [0.7, 0.85],
      }),
    ],
  });

  console.log('Imagenes optimizadas');
};

run().catch((error) => {
  console.error('Error optimizando imagenes', error);
  process.exit(1);
});
