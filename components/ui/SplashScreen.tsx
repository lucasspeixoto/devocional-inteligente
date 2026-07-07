import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Rect
} from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Paleta
// ---------------------------------------------------------------------------
const COLORS = {
  bg: '#1a0f05',
  bgCard: '#2a1505',
  gold: '#d4a550',
  goldDim: 'rgba(212,165,80,0.6)',
  goldFaint: 'rgba(212,165,80,0.3)',
  goldGhost: 'rgba(212,165,80,0.1)',
  border: '#3a2510',
  pageLine: 'rgba(212,165,80,0.25)',
  pageLineStrong: 'rgba(212,165,80,0.35)',
  shadow: 'rgba(0,0,0,0.4)',
};

// ---------------------------------------------------------------------------
// Stars (pontos brilhantes no fundo)
// ---------------------------------------------------------------------------
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 2 + 0.5,
  duration: 2000 + Math.random() * 3000,
  delay: Math.random() * 3000,
}));

function StarField() {
  const anims = useRef(
    STARS.map(() => new Animated.Value(0.1))
  ).current;

  useEffect(() => {
    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(STARS[i].delay),
          Animated.timing(anim, {
            toValue: 0.8,
            duration: STARS[i].duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.1,
            duration: STARS[i].duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <>
      {STARS.map((star, i) => (
        <Animated.View
          key={star.id}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: '#fff',
            opacity: anims[i],
          }}
        />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Livro SVG
// ---------------------------------------------------------------------------
function BookSVG() {
  return (
    <Svg width={160} height={140} viewBox="0 0 160 140">
      {/* spine dashed line */}
      <Line
        x1="80" y1="20" x2="80" y2="125"
        stroke={COLORS.goldFaint}
        strokeWidth="1"
        strokeDasharray="3,4"
      />

      {/* left page */}
      <Path
        d="M14 28 Q14 22 20 22 L78 22 L78 118 L20 118 Q14 118 14 112 Z"
        fill={COLORS.bgCard}
        stroke={COLORS.gold}
        strokeWidth="1.5"
      />

      {/* right page */}
      <Path
        d="M82 22 L140 22 Q146 22 146 28 L146 112 Q146 118 140 118 L82 118 Z"
        fill={COLORS.bgCard}
        stroke={COLORS.gold}
        strokeWidth="1.5"
      />

      {/* left page lines */}
      {[38, 47, 56, 65, 74, 83].map((y, idx) => (
        <Line
          key={`ll${idx}`}
          x1="28" y1={y} x2="72" y2={y}
          stroke={idx === 0 ? COLORS.pageLineStrong : COLORS.pageLine}
          strokeWidth={idx === 0 ? 0.8 : 0.6}
        />
      ))}

      {/* right page lines */}
      {[38, 47, 56, 65, 74, 83].map((y, idx) => (
        <Line
          key={`rl${idx}`}
          x1="88" y1={y} x2="132" y2={y}
          stroke={idx === 0 ? COLORS.pageLineStrong : COLORS.pageLine}
          strokeWidth={idx === 0 ? 0.8 : 0.6}
        />
      ))}

      {/* spine gold bar */}
      <Rect x="72" y="55" width="16" height="30" rx="1" fill={COLORS.gold} opacity={0.8} />
      <Line x1="80" y1="50" x2="80" y2="125" stroke={COLORS.gold} strokeWidth="2" />

      {/* cross above book */}
      <G transform="translate(80,10)">
        {/* vertical beam */}
        <Line x1="0" y1="-30" x2="0" y2="-6" stroke={COLORS.gold} strokeWidth="2" />
        {/* horizontal beam */}
        <Line x1="-12" y1="-22" x2="12" y2="-22" stroke={COLORS.gold} strokeWidth="2" />
        {/* arrowhead / pointer */}
        <Polygon points="0,-6 4,-14 -4,-14" fill={COLORS.gold} opacity={0.9} />
        {/* base glow dot */}
        <Circle cx="0" cy="-6" r="3" fill={COLORS.gold} opacity={0.5} />
      </G>

      {/* bottom page curl lines */}
      <Path
        d="M78 130 Q60 135 44 128"
        stroke={COLORS.goldDim}
        strokeWidth="1.5"
        fill="none"
      />
      <Path
        d="M82 130 Q100 135 116 128"
        stroke={COLORS.goldDim}
        strokeWidth="1.5"
        fill="none"
      />

      {/* shadow */}
      <Ellipse cx="80" cy="132" rx="50" ry="6" fill={COLORS.shadow} />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function BibleSplashScreen() {
  // valores animados
  const bookAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const crossAnim = useRef(new Animated.Value(0)).current;
  const dotsAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const raysAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // sequência de entrada
    Animated.sequence([
      // livro aparece
      Animated.timing(bookAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      // texto aparece
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      // linha divisória
      Animated.timing(crossAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // dots de carregamento
      Animated.timing(dotsAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // glow loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // raios rotativos
    Animated.loop(
      Animated.timing(raysAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // interpolações
  const bookScale = bookAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const bookTranslateY = bookAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });
  const textTranslateY = textAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const raysRotate = raysAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const glowScale = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });

  // raios (linhas em SVG giratório)
  const NUM_RAYS = 24;
  const RAY_LENGTH = Math.max(width, height) * 0.9;
  const cx = width / 2;
  const cy = height / 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Estrelas */}
      <StarField />

      {/* Raios giratórios */}
      <Animated.View
        style={[
          styles.raysWrapper,
          { transform: [{ rotate: raysRotate }] },
        ]}
        pointerEvents="none"
      >
        <Svg
          width={width * 2}
          height={height * 2}
          viewBox={`0 0 ${width * 2} ${height * 2}`}
          style={{ position: 'absolute', top: -height / 2, left: -width / 2 }}
        >
          {Array.from({ length: NUM_RAYS }, (_, i) => {
            const angle = ((360 / NUM_RAYS) * i * Math.PI) / 180;
            return (
              <Line
                key={i}
                x1={width}
                y1={height}
                x2={width + RAY_LENGTH * Math.cos(angle)}
                y2={height + RAY_LENGTH * Math.sin(angle)}
                stroke="rgba(212,165,80,0.06)"
                strokeWidth="1"
              />
            );
          })}
        </Svg>
      </Animated.View>

      {/* Ornamentos de canto */}
      <CornerOrnament style={styles.cornerTL} flipX={false} flipY={false} />
      <CornerOrnament style={styles.cornerTR} flipX={true} flipY={false} />
      <CornerOrnament style={styles.cornerBL} flipX={false} flipY={true} />
      <CornerOrnament style={styles.cornerBR} flipX={true} flipY={true} />

      {/* Glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          { opacity: glowAnim, transform: [{ scale: glowScale }] },
        ]}
        pointerEvents="none"
      />

      {/* Livro */}
      <Animated.View
        style={{
          opacity: bookAnim,
          transform: [
            { scale: bookScale },
            { translateY: bookTranslateY },
          ],
        }}
      >
        <BookSVG />
      </Animated.View>

      {/* Texto */}
      <Animated.View
        style={[
          styles.textArea,
          {
            opacity: textAnim,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        <Text style={styles.appName}>Devocional Inteligente</Text>
        <Text style={styles.appSubtitle}>A Bíblia Sagrada</Text>
        <Animated.View style={[styles.divider, { opacity: crossAnim }]} />
      </Animated.View>

      {/* Dots de carregamento */}
      <Animated.View style={[styles.dotsRow, { opacity: dotsAnim }]}>
        <LoadingDot delay={0} />
        <LoadingDot delay={200} />
        <LoadingDot delay={400} />
      </Animated.View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Ornamento de canto
// ---------------------------------------------------------------------------
function CornerOrnament({
  style,
  flipX,
  flipY,
}: {
  style: object;
  flipX: boolean;
  flipY: boolean;
}) {
  return (
    <View
      style={[
        styles.corner,
        style,
        {
          transform: [
            { scaleX: flipX ? -1 : 1 },
            { scaleY: flipY ? -1 : 1 },
          ],
        },
      ]}
      pointerEvents="none"
    >
      <Svg width={40} height={40} viewBox="0 0 40 40">
        <Path
          d="M2 38 L2 8 Q2 2 8 2 L38 2"
          stroke={COLORS.gold}
          strokeWidth="1.5"
          fill="none"
        />
        <Circle cx="2" cy="38" r="2" fill={COLORS.gold} />
        <Circle cx="38" cy="2" r="2" fill={COLORS.gold} />
      </Svg>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Dot animado
// ---------------------------------------------------------------------------
function LoadingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const scale = anim.interpolate({ inputRange: [0.3, 1], outputRange: [0.8, 1.2] });

  return (
    <Animated.View
      style={{
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: COLORS.goldDim,
        marginHorizontal: 4,
        opacity: anim,
        transform: [{ scale }],
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Estilos
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  raysWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 0,
    // Fundo semi-transparente para o glow
    backgroundColor: COLORS.goldGhost,
  },
  textArea: {
    alignItems: 'center',
    marginTop: 28,
  },
  appName: {
    fontFamily: 'serif', // Substitua por uma fonte carregada via expo-font
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.gold,
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  appSubtitle: {
    fontFamily: 'serif',
    fontSize: 13,
    color: COLORS.goldDim,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 6,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.goldFaint,
    marginTop: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 60,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    opacity: 0.35,
  },
  cornerTL: { top: 32, left: 24 },
  cornerTR: { top: 32, right: 24 },
  cornerBL: { bottom: 32, left: 24 },
  cornerBR: { bottom: 32, right: 24 },
});