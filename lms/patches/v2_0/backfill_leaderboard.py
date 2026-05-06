from lms.lms.tasks import backfill_leaderboard


def execute():
	backfill_leaderboard()
