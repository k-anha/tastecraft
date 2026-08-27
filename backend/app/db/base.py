# Import all the models, so that Base has them before being imported by Alembic or runtime scripts
from app.db.base_class import Base # noqa
from app.models.user import User # noqa
from app.models.restaurant import Restaurant, MenuItem # noqa
from app.models.review import Review, DishReview, ReviewComment, ReviewLike # noqa
from app.models.bookmark import Bookmark # noqa

