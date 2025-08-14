--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.activity_logs (
    id integer NOT NULL,
    team_id integer NOT NULL,
    user_id integer,
    action text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    ip_address character varying(45)
);


ALTER TABLE public.activity_logs OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.activity_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.activity_logs_id_seq OWNER TO postgres;

--
-- Name: activity_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.activity_logs_id_seq OWNED BY public.activity_logs.id;


--
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_reviews (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.product_reviews OWNER TO postgres;

--
-- Name: product_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_reviews_id_seq OWNER TO postgres;

--
-- Name: product_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_reviews_id_seq OWNED BY public.product_reviews.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    title character varying(100),
    description character varying(100),
    price numeric DEFAULT 0.0,
    old_price numeric,
    discount character varying,
    long_description character varying,
    image_url character varying(400),
    category character varying(100),
    start_date character varying(100),
    end_date character varying(100),
    location character varying(100),
    is_active boolean,
    user_id integer NOT NULL,
    "starAverage" numeric(2,1) DEFAULT 0.0 NOT NULL,
    num_reviews integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: team_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_members (
    id integer NOT NULL,
    user_id integer NOT NULL,
    team_id integer NOT NULL,
    role character varying(50) NOT NULL,
    joined_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.team_members OWNER TO postgres;

--
-- Name: team_members_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.team_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.team_members_id_seq OWNER TO postgres;

--
-- Name: team_members_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.team_members_id_seq OWNED BY public.team_members.id;


--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_product_id text,
    plan_name character varying(50),
    subscription_status character varying(20)
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teams_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teams_id_seq OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teams_id_seq OWNED BY public.teams.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100),
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) DEFAULT 'member'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted_at timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: activity_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs ALTER COLUMN id SET DEFAULT nextval('public.activity_logs_id_seq'::regclass);


--
-- Name: product_reviews id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews ALTER COLUMN id SET DEFAULT nextval('public.product_reviews_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: team_members id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members ALTER COLUMN id SET DEFAULT nextval('public.team_members_id_seq'::regclass);


--
-- Name: teams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams ALTER COLUMN id SET DEFAULT nextval('public.teams_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	5e39cf18f3b8efb5769ce179c15d68929edbffa8f7205a3cad67d1868365bc72	1753877372413
\.


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.activity_logs (id, team_id, user_id, action, "timestamp", ip_address) FROM stdin;
1	2	2	CREATE_TEAM	2025-07-30 12:10:28.690398	
2	2	2	SIGN_UP	2025-07-30 12:10:28.698339	
3	2	2	UPDATE_ACCOUNT	2025-07-30 12:12:11.981588	
4	2	2	SIGN_OUT	2025-07-30 14:53:16.114577	
5	3	3	CREATE_TEAM	2025-07-30 14:53:59.232568	
6	3	3	SIGN_UP	2025-07-30 14:53:59.239509	
7	3	3	UPDATE_ACCOUNT	2025-07-30 14:54:11.212476	
8	3	3	SIGN_OUT	2025-07-30 15:11:19.772987	
9	4	4	CREATE_TEAM	2025-07-30 15:13:08.37775	
10	4	4	SIGN_UP	2025-07-30 15:13:08.38233	
11	4	4	UPDATE_ACCOUNT	2025-07-30 15:14:08.002354	
12	5	5	CREATE_TEAM	2025-08-01 12:36:36.4093	
13	5	5	SIGN_UP	2025-08-01 12:36:36.418412	
14	6	6	CREATE_TEAM	2025-08-02 06:57:55.722836	
15	6	6	SIGN_UP	2025-08-02 06:57:55.737331	
16	6	6	SIGN_IN	2025-08-02 06:58:41.418631	
17	5	5	SIGN_OUT	2025-08-02 08:56:33.555375	
18	7	7	CREATE_TEAM	2025-08-02 08:56:44.445146	
19	7	7	SIGN_UP	2025-08-02 08:56:44.452562	
20	7	7	UPDATE_ACCOUNT	2025-08-02 09:03:27.805337	
\.


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_reviews (id, product_id, user_id, rating, comment, created_at, updated_at) FROM stdin;
1	2	2	2	nice	2025-07-30 12:12:42.758	2025-07-30 12:12:42.758
3	1	2	5	cool	2025-07-30 13:14:55.577	2025-07-30 13:14:55.577
4	3	2	3	hey	2025-07-30 13:41:44.593	2025-07-30 13:41:44.593
5	2	3	3	nice	2025-07-30 14:54:36.326	2025-07-30 14:54:36.326
6	1	4	2	Yoo	2025-07-30 15:14:26.499	2025-07-30 15:14:26.499
8	23	7	2	cool 	2025-08-02 09:03:05.109	2025-08-02 09:03:05.109
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, title, description, price, old_price, discount, long_description, image_url, category, start_date, end_date, location, is_active, user_id, "starAverage", num_reviews, created_at, updated_at) FROM stdin;
1	Weekend Brunch Special	20% off all brunch stuff	20	\N	10%	The first light of dawn spills over the horizon, painting the sky in soft hues of pink and gold, as the farmer’s market begins to stir to life. The air is crisp and carries the earthy scent of dew-kissed vegetables, freshly baked bread, and bundles of herbs still damp from the morning harvest. Wooden stalls, weathered by seasons of use, are arranged in neat rows, their canopies fluttering slightly in the gentle breeze. Vendors, their hands calloused from years of labor, meticulously arrange their produce—plump tomatoes gleaming like rubies, leafy greens stacked in vibrant pyramids, and baskets of berries so ripe they seem to glow under the rising sun.	https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60	food	2023-06-01	2023-06-30	granada	t	1	3.5	2	2025-07-30 12:09:39.960182	2025-07-30 15:14:26.506
21	NIIIIIICEEE	 in multi-part forms that have async functionality and save for later capabilities where you have 	20	\N	20%	\nIn all seriousness. There is no 1 perfect or “best” solution. Form and data validation can be anything from trivial to annoyingly complicated. It all comes down to what your application needs. If it’s something like, do the fields have input of a specific length then you can sneak by with the simplest thing. If on the extreme end you are validating inputs in multi-part forms that have async functionality and save for later capabilities where you have to ensure data is not only retrievable but formatting is p	https://t3.ftcdn.net/jpg/11/86/32/62/360_F_1186326217_w0LDFI0Mv6G8gJnSBypbcVWvX1KWyDh0.jpg	fitness	2024-04-21	2025-04-21	granada	t	5	0.0	0	2025-08-02 07:32:58.058	2025-08-02 07:32:58.058
22	hh	hh	20	\N	20%	hh	https://t3.ftcdn.net/jpg/11/86/32/62/360_F_1186326217_w0LDFI0Mv6G8gJnSBypbcVWvX1KWyDh0.jpg	food		2025-08-09	granada	t	5	0.0	0	2025-08-02 08:11:25.278	2025-08-02 08:11:25.278
10	Something	hey	1.2	\N	3%	\N	https://t3.ftcdn.net/jpg/11/86/32/62/360_F_1186326217_w0LDFI0Mv6G8gJnSBypbcVWvX1KWyDh0.jpg	electronics	2025-07-30	2025-08-06	granada	t	2	0.0	0	2025-07-30 12:30:06.486	2025-07-30 12:30:06.486
12	her		12	\N	50%	\N	https://t3.ftcdn.net/jpg/11/86/32/62/360_F_1186326217_w0LDFI0Mv6G8gJnSBypbcVWvX1KWyDh0.jpg	food	2025-07-30	2025-08-06	granada	t	2	0.0	0	2025-07-30 12:46:21.319	2025-07-30 12:46:21.319
11	something	hey	233	\N	1%	\N	https://cloudfront-us-east-1.images.arcpublishing.com/gray/5V62QS6ZHNF6DBA7656F3RS4UY.jpg	food	2025-07-30	2025-08-06	granada	t	2	0.0	0	2025-07-30 12:46:09.61	2025-07-30 12:46:09.61
13	222	2222	12.2	\N	20%	\N	https://t3.ftcdn.net/jpg/11/86/32/62/360_F_1186326217_w0LDFI0Mv6G8gJnSBypbcVWvX1KWyDh0.jpg	food	2025-07-30	2025-08-06	granada	t	2	0.0	0	2025-07-30 12:46:42.212	2025-07-30 12:46:42.212
3	Tech Gadgets Sale	30% off electronics.	199	\N	25%	As the sun climbs higher, the market swells with energy. A fishmonger shouts prices over the din, his ice-packed counter glistening with silvery mackerel and rosy fillets of salmon. A cheesemonger offers slivers of aged gouda to passersby, its nutty richness lingering on the tongue. The scent of sizzling sausages from a food truck cuts through the sweetness, drawing a line of hungry patrons.	https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60	electronics	2023-06-10	2023-06-20	madrid	t	1	3.0	1	2025-07-30 12:09:39.960182	2025-07-30 13:41:44.604
4	fligh	going on a flight	30.20	\N	5%	\N	https://cloudfront-us-east-1.images.arcpublishing.com/gray/5V62QS6ZHNF6DBA7656F3RS4UY.jpg	food	2025-07-30	2025-08-06		t	2	0.0	0	2025-07-30 12:10:59.655	2025-07-30 14:51:25.146
2	Summer Fitness Package	3 months of gym membership half price.	45	\N	30%	At the center of the square, a coffee cart exhales fragrant steam, its proprietor grinding beans with rhythmic precision. The rich, smoky aroma mingles with the sweetness of pastries from the neighboring baker, whose flaky croissants and crusty sourdough loaves are still warm from the oven. Nearby, a flower seller drapes garlands of lavender and sunflowers over her stall, their petals trembling as she adjusts them. Honeybees, drawn by the blossoms, hover lazily in the air, their hum blending with the murmur of early shoppers. \n The market is a symphony of sounds—the crunch of gravel underfoot, the clink of glass jars filled with preserves, the occasional burst of laughter between farmers who’ve known each other for decades. A fiddler tunes his instrument at the far end, his notes tentative but warm, promising lively tunes once the crowd thickens. Children dart between stalls, their fingers sticky from stolen samples of fruit, while elderly couples move slowly, inspecting each peach and cucumber with practiced eyes.	https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60	fitness	2023-06-15	2023-08-31	sevilla	t	1	2.5	2	2025-07-30 12:09:39.960182	2025-07-30 14:54:36.335
20	something	descrip[tion	15	\N	40%	here is the long description aekrjgnfweorjgb wekrjn,ewr kwerf	https://t3.ftcdn.net/jpg/11/86/32/62/360_F_1186326217_w0LDFI0Mv6G8gJnSBypbcVWvX1KWyDh0.jpg	food	2025-08-01	2025-08-08	granada	t	5	0.0	0	2025-08-01 20:27:33.597	2025-08-01 20:27:33.597
23	beautifully designed components	I tend to go with zod, not because it is way better but simply because it’s a little bit less code 	16	\N	68%	\t\nInput will be unregistered after unmount and defaultValues will be removed as well.\n\nNote: this prop should be avoided when using with useFieldArray as unregister function gets called after input unmount/remount and reorder.\n\ndisabled\tboolean = false\t\t\ndisabled prop will be returned from `field` prop. Controlled input will be disabled and its value will be omitted from the submission data.\n\ndefaultValue\tunknown\t\t\nImportant: Can not apply undefined to defaultValue or defaultValues at useForm.\n\nYou need to either set defaultValue at the field-level or useForm's defaultValues. undefined is not a valid value. If you used defaultValues at useForm, skip using this prop.\n\nIf your form will invoke reset with default values, you will need to provide useForm with defaultValues.	https://t3.ftcdn.net/jpg/11/86/32/62/360_F_1186326217_w0LDFI0Mv6G8gJnSBypbcVWvX1KWyDh0.jpg	food	2025-02-15		granada	t	7	2.0	1	2025-08-02 09:00:43.913	2025-08-02 09:03:05.12
\.


--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, user_id, team_id, role, joined_at) FROM stdin;
1	1	1	owner	2025-07-30 12:09:37.691063
2	2	2	owner	2025-07-30 12:10:28.698322
3	3	3	owner	2025-07-30 14:53:59.254153
4	4	4	owner	2025-07-30 15:13:08.38233
5	5	5	owner	2025-08-01 12:36:36.432215
6	6	6	owner	2025-08-02 06:57:55.753507
7	7	7	owner	2025-08-02 08:56:44.470082
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, created_at, updated_at, stripe_customer_id, stripe_subscription_id, stripe_product_id, plan_name, subscription_status) FROM stdin;
1	Test Team	2025-07-30 12:09:37.686737	2025-07-30 12:09:37.686737	\N	\N	\N	\N	\N
2	hunterjohnst1@gmail.com's Team	2025-07-30 12:10:28.685849	2025-07-30 12:10:28.685849	\N	\N	\N	\N	\N
3	luacia@gmailc.om's Team	2025-07-30 14:53:59.227638	2025-07-30 14:53:59.227638	\N	\N	\N	\N	\N
4	huntet1@gmail.com's Team	2025-07-30 15:13:08.374051	2025-07-30 15:13:08.374051	\N	\N	\N	\N	\N
5	hunthnst1@gmail.com's Team	2025-08-01 12:36:36.406242	2025-08-01 12:36:36.406242	\N	\N	\N	\N	\N
6	h@j.com's Team	2025-08-02 06:57:55.718244	2025-08-02 06:57:55.718244	\N	\N	\N	\N	\N
7	toooto@gmail.com's Team	2025-08-02 08:56:44.440516	2025-08-02 08:56:44.440516	\N	\N	\N	\N	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password_hash, role, created_at, updated_at, deleted_at) FROM stdin;
1	\N	test@test.com	$2b$10$3rDLeV6/30eH9.UrnFg6gO0hPcdUFI2bkOPBC8qklXSWUKN6O8Hhm	owner	2025-07-30 12:09:37.679922	2025-07-30 12:09:37.679922	\N
2	Huntr	hunterjohnst1@gmail.com	$2b$10$TOS87mmj/7FCIee9.5hJ1.G8s2YOHeE45BAdUXloCIXqy8G3EDhr.	owner	2025-07-30 12:10:28.680117	2025-07-30 12:10:28.680117	\N
3	lucia	luacia@gmailc.om	$2b$10$E4aI9JKvWLs/40m324jQHOD1/T7YyyD/1PM1BZ.JpeVGi.W1jhV6S	owner	2025-07-30 14:53:59.221912	2025-07-30 14:53:59.221912	\N
4	yuri	huntet1@gmail.com	$2b$10$e2pSm1XwHg2181jPC3C/8uKfooON/zKahRBBp4wLS6FskLU2DrjMe	owner	2025-07-30 15:13:08.370475	2025-07-30 15:13:08.370475	\N
5	\N	hunthnst1@gmail.com	$2b$10$fmhiDqxtGXdp9T9PZqM0gexjxAkGl8qWvBCqWi3JkrGAgCss4tXVC	owner	2025-08-01 12:36:36.400926	2025-08-01 12:36:36.400926	\N
6	\N	h@j.com	$2b$10$mXO31MXcZ9ixwBAbrl3/jeiT1HCV6YGlJfIcc/M7ou2tAd.Tp482a	owner	2025-08-02 06:57:55.707118	2025-08-02 06:57:55.707118	\N
7	hunter	toooto@gmail.com	$2b$10$Jc05oOKxbWNcSgvxBnSqb.ZtrjKhAPUHZOZ2Kp9V4CUdnKK3M2HEe	owner	2025-08-02 08:56:44.435376	2025-08-02 08:56:44.435376	\N
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 1, true);


--
-- Name: activity_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.activity_logs_id_seq', 20, true);


--
-- Name: product_reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_reviews_id_seq', 8, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 23, true);


--
-- Name: team_members_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.team_members_id_seq', 7, true);


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.teams_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: teams teams_stripe_customer_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_stripe_customer_id_unique UNIQUE (stripe_customer_id);


--
-- Name: teams teams_stripe_subscription_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: review_product_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX review_product_idx ON public.product_reviews USING btree (product_id);


--
-- Name: review_rating_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX review_rating_idx ON public.product_reviews USING btree (rating);


--
-- Name: review_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX review_user_idx ON public.product_reviews USING btree (user_id);


--
-- Name: unique_product_user_review; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_product_user_review ON public.product_reviews USING btree (product_id, user_id);


--
-- Name: activity_logs activity_logs_team_id_teams_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_team_id_teams_id_fk FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: activity_logs activity_logs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: product_reviews product_reviews_product_id_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_product_id_products_id_fk FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: product_reviews product_reviews_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: products products_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: team_members team_members_team_id_teams_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_teams_id_fk FOREIGN KEY (team_id) REFERENCES public.teams(id);


--
-- Name: team_members team_members_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

