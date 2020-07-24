DAYS = 0
WEEK = 1
HALF_MONTH = 2
MONTH = 3


def get_substraction_factor(stepSize):
    substraction_factor = 7
    if stepSize == MONTH:
        substraction_factor = 30
    elif stepSize == HALF_MONTH:
        substraction_factor = 15
    elif stepSize == DAYS:
        substraction_factor = 1
    return substraction_factor
